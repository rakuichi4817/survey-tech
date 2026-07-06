---
title: Terraform実例 (Azure App Service + DocumentDB + Foundry 対話システム)
description: Azureで対話システムを作る想定で、Terraformの実践的なフォルダ構成、実装例、運用ポイントをまとめる
sidebar:
  order: 3
---

# Terraform実例 (Azure App Service + DocumentDB + Foundry 対話システム)

## 要約

このページは、次の構成をTerraformで管理する実例です。

- フロント/API: Azure App Service
- 会話データ: Azure Cosmos DB (NoSQL) または Azure DocumentDB
- モデル呼び出し基盤: Microsoft Foundry

「まず動く最小構成」を重視して、dev環境を作る前提で説明します。

## 想定アーキテクチャ

```text
Users
  -> App Service (Web/API)
     -> Cosmos DB (chat history, session, profile)
     -> Microsoft Foundry endpoint (model inference)

Observability
  -> Log Analytics / App Insights (任意)
```

## この実例での前提

- Terraform CLI: 1.6+
- AzureRM Provider: 4.x系
- 認証: `az login`またはService Principal
- 環境: `dev`から開始

## フォルダ構成例

```text
infra/
  modules/
    app_service/
      main.tf
      variables.tf
      outputs.tf
    data_store/
      main.tf
      variables.tf
      outputs.tf
    foundry/
      main.tf
      variables.tf
      outputs.tf
  envs/
    dev/
      main.tf
      providers.tf
      variables.tf
      terraform.tfvars
      backend.hcl
```

## `tfvars`と`tfstate`を含む最小運用テンプレート

```text
infra/
  envs/
    dev/
      backend.hcl
      dev.tfvars
      dev.example.tfvars
    prod/
      backend.hcl
      prod.tfvars
      prod.example.tfvars
```

`*.example.tfvars`だけをGit管理し、実値の`*.tfvars`はCI secretまたは安全な保管場所で管理します。
詳細ルールは[Terraform運用設計ガイド (Azure向け)](./terraform-azure-operations-and-structure-guide/)を参照してください。

### `backend.hcl` 例 (dev)

```hcl
resource_group_name  = "rg-tfstate-shared"
storage_account_name = "sttfstate001"
container_name       = "tfstate"
key                  = "chat-system/dev/terraform.tfstate"
use_azuread_auth     = true
use_cli              = true
tenant_id            = "<TENANT_ID>"
```

### `dev.example.tfvars` 例

```hcl
project          = "chat-system"
env              = "dev"
location         = "japaneast"
foundry_endpoint = "https://<foundry-resource>.services.ai.azure.com"
```

### 実行時の固定コマンド (dev)

```bash
terraform -chdir=infra/envs/dev init -backend-config=backend.hcl
terraform -chdir=infra/envs/dev plan -var-file=dev.tfvars -out tfplan
terraform -chdir=infra/envs/dev apply tfplan
```

ポイント:

- `-var-file`を固定し、値の混線を防ぐ
- `key`で環境を分離し、state衝突を防ぐ
- `apply`はCIで1ジョブずつ直列化する

## ルート (`envs/dev/main.tf`) 例

```hcl
module "app_service" {
  source              = "../../modules/app_service"
  project             = var.project
  env                 = var.env
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

module "data_store" {
  source              = "../../modules/data_store"
  project             = var.project
  env                 = var.env
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

module "foundry" {
  source              = "../../modules/foundry"
  project             = var.project
  env                 = var.env
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}
```

## Module 1: App Service

最小構成として、Plan + Linux Web Appを作成します。

```hcl
resource "azurerm_service_plan" "this" {
  name                = "asp-${var.project}-${var.env}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "this" {
  name                = "app-${var.project}-${var.env}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    COSMOS_ENDPOINT = var.cosmos_endpoint
    FOUNDRY_ENDPOINT = var.foundry_endpoint
    WEBSITES_PORT   = "8080"
  }
}
```

## Module 2: DocumentDB/Cosmos DB

実務では「会話履歴」「セッション」「ユーザープロファイル」をJSONドキュメントで持つことが多いため、まずはCosmos DB (NoSQL)を推奨します。

```hcl
resource "azurerm_cosmosdb_account" "this" {
  name                = "cdb${var.project}${var.env}"
  location            = var.location
  resource_group_name = var.resource_group_name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "chat" {
  name                = "chatdb"
  resource_group_name = var.resource_group_name
  account_name        = azurerm_cosmosdb_account.this.name
}

resource "azurerm_cosmosdb_sql_container" "messages" {
  name                = "messages"
  resource_group_name = var.resource_group_name
  account_name        = azurerm_cosmosdb_account.this.name
  database_name       = azurerm_cosmosdb_sql_database.chat.name
  partition_key_paths = ["/tenantId", "/sessionId"]
}
```

補足:

- 旧称としてDocumentDBが使われることがあります
- 現在は用途により「Cosmos DB (RU/serverless)」と「Azure DocumentDB (vCore)」を選びます
- 対話システムの最初の1歩はCosmos DB NoSQLが組みやすいです

## Module 3: Microsoft Foundry

Foundryの機能は更新が速いため、Terraformでは「Foundryで使うモデル基盤リソース」をまず管理し、プロジェクト内設定はPortal/APIで補完する設計が現実的です。

```hcl
resource "azurerm_cognitive_account" "foundry" {
  name                = "fnd-${var.project}-${var.env}"
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "OpenAI"
  sku_name            = "S0"
}

resource "azurerm_cognitive_deployment" "chat_model" {
  name                 = "gpt-4o-mini-chat"
  cognitive_account_id = azurerm_cognitive_account.foundry.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o-mini"
    version = "latest"
  }

  sku {
    name     = "Standard"
    capacity = 10
  }
}
```

注意:

- Foundryの新機能すべてが即時にTerraform Providerへ反映されるとは限りません
- Terraformで管理する範囲と、Portal/APIで管理する範囲を設計時に分けると運用しやすいです

## 環境変数とシークレット管理

最低限、次をアプリ側へ渡します。

- Cosmos DB endpoint
- Cosmos DB key (Key Vault経由推奨)
- Foundry endpoint
- Foundry credential (Managed Identity推奨)

実運用では、App Serviceのシークレット直書きではなく、Key Vault参照へ寄せるのが安全です。

## 実行コマンド例 (dev)

```bash
terraform -chdir=infra/envs/dev init -backend-config=backend.hcl
terraform -chdir=infra/envs/dev fmt -recursive
terraform -chdir=infra/envs/dev validate
terraform -chdir=infra/envs/dev plan -var-file=dev.tfvars -out tfplan
terraform -chdir=infra/envs/dev apply tfplan
```

## 段階的に拡張する順序

1. 単一リージョン/devで最小構成を構築
2. App Insights、Log Analyticsを追加
3. Key Vault + Managed Identity化
4. stg/prod環境を追加
5. 監査・コスト・可用性要件に合わせてSKU最適化

## コストと運用の観点

- App Service: 開発中は小さいPlan、負荷に応じてスケール
- Cosmos DB/DocumentDB: パーティション設計が性能とコストを大きく左右
- Foundry: モデル/スループット設定がコスト直結

## リスクと対策

- Provider未対応機能: 代替としてazapiや補助スクリプトを検討
- state肥大化: module分割と環境分離で影響範囲を限定
- 手動変更ドリフト: 変更窓口をIaCへ統一

## 関連ページ

- [Terraform入門 (Azure向け)](./terraform-basics-for-azure/)
- [Terraform運用設計ガイド (Azure向け)](./terraform-azure-operations-and-structure-guide/)

## 参照情報

- Azure App Service Docs: https://learn.microsoft.com/en-us/azure/app-service/
- Azure Cosmos DB Overview: https://learn.microsoft.com/en-us/azure/cosmos-db/overview
- Azure DocumentDB vs Cosmos DB: https://learn.microsoft.com/en-us/azure/documentdb/compare-cosmos-db
- Microsoft Foundry Overview: https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry
- Terraform AzureRM Provider: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs
- Terraform Language: https://developer.hashicorp.com/terraform/language
- Terraform State: https://developer.hashicorp.com/terraform/language/state
- Terraform Backend azurerm: https://developer.hashicorp.com/terraform/language/backend/azurerm
- Store Terraform state in Azure Storage: https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage

## 追加調査TODO

- Foundry新ポータル/新APIに対するTerraformネイティブ対応の最新状況を確認する
- `azapi` provider併用時の責務分担テンプレートを作る
- DocumentDB (vCore)を選ぶ判断基準を、実測ベンチ付きで別ページ化する
