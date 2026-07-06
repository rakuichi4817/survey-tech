---
title: Terraform運用設計ガイド (Azure向け)
description: Terraformの運用を前提に、ファイル構成、tfvars管理、tfstate管理、CI/CD、変更フローを実務目線で整理する
sidebar:
  order: 2
---

# Terraform運用設計ガイド (Azure向け)

## 要約

Terraform運用で事故を減らすには、次の3点を最初に固定するのが効果的です。

- ディレクトリ責務 (`modules`と`envs`の分離)
- 変数責務 (`variables.tf`と`*.tfvars`の分離)
- state責務 (環境ごとのbackend分離)

このページは、Azure App Service + DocumentDB/Cosmos DB + Foundry構成にもそのまま適用できる運用ガイドです。

## 管理方針 (最初に決めること)

1. 1環境1stateを原則にする
2. `plan`結果をレビューしてから`apply`する
3. Portal直接変更を例外運用にする
4. シークレットは`tfvars`に置かない
5. `apply`はCIで直列実行する

## 推奨ディレクトリ構成

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
      backend.hcl
      dev.tfvars
      dev.example.tfvars
    stg/
      main.tf
      providers.tf
      variables.tf
      backend.hcl
      stg.tfvars
      stg.example.tfvars
    prod/
      main.tf
      providers.tf
      variables.tf
      backend.hcl
      prod.tfvars
      prod.example.tfvars
```

### 役割の切り分け

- `modules/`: 再利用可能な部品。環境固有値は持たない
- `envs/`: 環境差分を持つ。`tfvars`と`backend`を環境単位で分離
- `*.example.tfvars`: Git管理するサンプル値
- 実値`*.tfvars`: Git管理しない

## `tfvars`管理ルール

### 推奨ルール

- 変数定義は`variables.tf`に集約
- 実値は`<env>.tfvars`で分離
- 実行時は`-var-file=<env>.tfvars`を必ず明示
- `*.auto.tfvars`は、意図的運用でない限り使わない

### 典型テンプレート

```hcl
# envs/dev/dev.example.tfvars
project          = "chat-system"
env              = "dev"
location         = "japaneast"
foundry_endpoint = "https://<foundry-resource>.services.ai.azure.com"
```

```bash
terraform -chdir=infra/envs/dev plan -var-file=dev.tfvars -out tfplan
```

## `tfstate`管理ルール

### backendの分離

```hcl
# envs/dev/backend.hcl
resource_group_name  = "rg-tfstate-shared"
storage_account_name = "sttfstate001"
container_name       = "tfstate"
key                  = "chat-system/dev/terraform.tfstate"
use_azuread_auth     = true
use_cli              = true
tenant_id            = "<TENANT_ID>"
```

`key`命名は`<system>/<env>/terraform.tfstate`を統一すると管理しやすくなります。

### 認証の優先順位

1. OIDC / Workload Identity Federation
2. Managed Identity
3. Azure CLI (ローカル開発)
4. Access Key (新規では非推奨)

### state運用の禁止事項

- `terraform.tfstate`の手編集
- stateファイルのGitコミット
- 複数ジョブ同時`apply`

## 変更フロー (チーム標準)

1. feature branchで`.tf`変更
2. `fmt`/`validate`/`plan`実行
3. `tfplan`またはplan差分をPRでレビュー
4. mainマージ後にCIで`apply`
5. 適用ログと変更チケットをひも付け

## CI/CDでの最低チェック

- `terraform fmt -check`
- `terraform validate`
- `terraform plan -var-file=<env>.tfvars`
- 手動承認ステップ (prod)
- `apply`は排他制御付き

## `.gitignore`の基準

```gitignore
.terraform/
*.tfstate
*.tfstate.*
*.tfvars
!*.example.tfvars
crash.log
crash.*.log
override.tf
override.tf.json
*_override.tf
*_override.tf.json
```

`.terraform.lock.hcl`はproviderの再現性確保に有効なため、通常はGit管理を推奨します。

## Azure構成での責務分担 (App Service + DocumentDB/Cosmos DB + Foundry)

- `app_service` module: Web App、Plan、アプリ設定
- `data_store` module: Cosmos DB/DocumentDB関連
- `foundry` module: Foundryで使うモデル基盤リソース
- 環境別エンドポイント/スケールは`envs/*/*.tfvars`で差分管理

## 関連ページ

- [Terraform入門 (Azure向け)](./terraform-basics-for-azure/)
- [Terraform実例: Azure App Service + DocumentDB + Foundry 対話システム](./terraform-azure-appservice-documentdb-foundry-chat-example/)

## 参照情報

- Terraform Variables: https://developer.hashicorp.com/terraform/language/values/variables
- Terraform State: https://developer.hashicorp.com/terraform/language/state
- Terraform Backend azurerm: https://developer.hashicorp.com/terraform/language/backend/azurerm
- Store Terraform state in Azure Storage: https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage
- Terraform CLI: https://developer.hashicorp.com/terraform/cli/commands

## 追加調査TODO

- GitHub Actions/Azure DevOpsそれぞれのOIDC最小権限テンプレートを作成する
- prod向け承認フロー付きPipelineひな形をPoC化する
