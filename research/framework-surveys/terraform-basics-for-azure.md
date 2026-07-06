---
title: Terraform入門 (Azure向け)
description: Terraformが初めての人向けに、概念、基本コマンド、状態管理、フォルダ構成、Azureでの始め方を丁寧にまとめる
sidebar:
  order: 1
---

# Terraform入門 (Azure向け)

## 要約

Terraformは「インフラをコードで管理する」ためのツールです。

- 何を作りたいかを`.tf`ファイルで宣言する
- `plan`で差分を確認する
- `apply`で実際にAzureへ反映する
- 状態は`state`で管理する

最初は「CLIの流れ」と「stateを壊さない運用」を覚えるのが最短です。

## このシリーズの読み方

- 本ページ: Terraformの基本概念と基本操作
- 運用設計ガイド: ファイル構成、`tfvars`/`tfstate`、CI/CD運用ルール
- 実例ページ: App Service + DocumentDB/Cosmos DB + Foundryの実装イメージ

## 解決する課題

Terraformを使うと、次の課題を減らせます。

- Portal手作業での設定漏れ
- 環境ごとの差分の見落とし
- インフラ変更履歴の追跡困難
- 再現性のない構築手順

## 主要概念

### 宣言的な設定 (HCL)

Terraformは「手順」ではなく「最終状態」を書きます。

```hcl
resource "azurerm_resource_group" "main" {
  name     = "rg-demo-dev-japaneast"
  location = "japaneast"
}
```

### Provider

Azureを操作するために`azurerm` providerを使います。

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}
```

### Resource / Data Source

- `resource`: Terraformが作成・更新・削除する対象
- `data`: 既存リソースを参照するだけの対象

### Variable / Local / Output

- `variable`: 外から値を入れる
- `locals`: 設定内で使う中間値
- `output`: 作成後に参照したい値

### State

Terraformは作成済みリソース情報を`state`で追跡します。

- ローカルstate (`terraform.tfstate`) は個人検証向け
- チーム運用はリモートstate推奨
- stateには機密値が入る可能性があるため、Git管理しない

## 基本ワークフロー

## 1. ログイン

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID_OR_NAME>"
```

## 2. 初期化

```bash
terraform init
```

## 3. 構文/整形チェック

```bash
terraform fmt -recursive
terraform validate
```

## 4. 差分確認

```bash
terraform plan -out tfplan
```

## 5. 反映

```bash
terraform apply tfplan
```

## 6. 削除 (検証環境)

```bash
terraform destroy
```

## 最初に覚えるフォルダ構成

単一環境を最速で回す構成:

```text
terraform/
  main.tf
  variables.tf
  outputs.tf
  versions.tf
  terraform.tfvars
```

運用向けに分ける構成:

```text
infra/
  modules/
    app_service/
    cosmosdb/
    foundry/
  envs/
    dev/
      main.tf
      backend.hcl
      terraform.tfvars
    stg/
      main.tf
      backend.hcl
      terraform.tfvars
    prod/
      main.tf
      backend.hcl
      terraform.tfvars
```

ポイント:

- `modules/`: 再利用部品
- `envs/dev|stg|prod`: 環境差分
- `backend.hcl`: state保存先を環境ごとに分離

## Azureでよく使う認証パターン

### ローカル開発

- `az login`したユーザーで実行
- 小規模検証向け

### CI/CD

- Service PrincipalやWorkload Identityを使用
- 最小権限(RBAC)で運用

## `tfvars`運用の基本

`tfvars`は「環境差分を安全に扱う」ための要です。

### 役割分担のおすすめ

- `variables.tf`: 変数の型、説明、デフォルト
- `terraform.tfvars`: ローカル開発の既定値 (機密なし)
- `<env>.tfvars`: 環境別値 (`dev.tfvars`, `prod.tfvars`)
- `*.auto.tfvars`: 自動読み込みしたい値

### 優先順位 (重要)

同じ変数に複数の値がある場合、概ね次の優先順位で上書きされます。

1. CLIの`-var` / `-var-file`
2. `*.auto.tfvars`
3. `terraform.tfvars(.json)`
4. `TF_VAR_`環境変数
5. `variable`の`default`

意図しない値混入を防ぐため、チームでは`-var-file=envs/dev/dev.tfvars`のように明示指定する運用が安全です。

### `tfvars`に書かない方がよいもの

- APIキー
- パスワード
- Client Secret

これらはKey VaultやCI secretで渡し、`TF_VAR_...`やOIDC認証を使う方針にします。

### 変数定義の例

```hcl
variable "environment" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["dev", "stg", "prod"], var.environment)
    error_message = "environment must be one of dev/stg/prod"
  }
}

variable "foundry_endpoint" {
  type        = string
  description = "Microsoft Foundry endpoint"
}
```

```hcl
# dev.tfvars
environment      = "dev"
location         = "japaneast"
project          = "chatops"
foundry_endpoint = "https://<resource>.services.ai.azure.com"
```

## `tfstate`運用の基本

`tfstate`はTerraformの実体管理台帳です。運用ルールを最初に決めると事故が激減します。

### なぜローカルstateを避けるか

- 共同作業に弱い
- 紛失/上書きリスクが高い
- 機密情報露出リスクがある

### Azure Storage backendの最小例

```hcl
terraform {
  backend "azurerm" {}
}
```

```hcl
# envs/dev/backend.hcl
resource_group_name  = "rg-tfstate-shared"
storage_account_name = "sttfstate001"
container_name       = "tfstate"
key                  = "chatops/dev/terraform.tfstate"
use_azuread_auth     = true
use_cli              = true
tenant_id            = "<TENANT_ID>"
```

```bash
terraform -chdir=infra/envs/dev init -backend-config=backend.hcl
```

### backend設計のポイント

- `key`で環境/システムを必ず分離 (`chatops/prod/terraform.tfstate`)
- state保管用Storage Accountはアプリ本体と分離
- Blobのアクセス権は最小権限 (Storage Blob Data Contributorなど)
- 可能ならOIDC/Managed Identity優先、Access Key直運用は避ける

### stateロックと同時実行

Azure Blob backendはロックを使えます。`apply`は1環境1ジョブに制限し、CIで直列化します。

### stateを壊さない原則

- `terraform.tfstate`を手編集しない
- `terraform state rm` / `import`は手順化してレビューする
- 既存リソース取り込み時はまず`plan`で差分確認する

### state移行時の実務手順

1. 既存ローカルstateをバックアップ
2. backend設定を追加
3. `terraform init -migrate-state`
4. `terraform plan`で差分がないことを確認
5. 旧stateの扱いをチームで明文化

## `.gitignore`の推奨例

```gitignore
.terraform/
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
!*.example.tfvars
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraform.lock.hcl
```

補足: `.terraform.lock.hcl`はチームでproviderバージョン固定に使うため、運用方針次第で管理対象にします。

## よくあるつまずき

### 1. state競合

複数人が同時`apply`すると壊れやすいです。ロックできるリモートbackendを使います。

### 2. 手動変更ドリフト

Portalで手動変更すると、次回`plan`で意図しない差分が出ます。変更経路をTerraformに統一します。

### 3. バージョン固定不足

Terraform本体とproviderはバージョン固定を推奨します。

### 4. `tfvars`の混線

`terraform.tfvars`と`*.auto.tfvars`を混在させると、どの値が効いているか分かりづらくなります。環境ごとに`-var-file`を固定してください。

### 5. backend認証情報の平文管理

`-backend-config`やコードに秘密情報を直接書くと漏えいリスクが上がります。環境変数/OIDC/Managed Identityを優先します。

## 最初の学習順序

1. `init -> plan -> apply -> destroy`を1回通す
2. `variable`/`output`で値の受け渡しに慣れる
3. `module`で分割する
4. リモートstateへ移行する
5. CI/CDに組み込む

## 採用に向くケース

- Azureリソースを繰り返し作る
- dev/stg/prodを揃えたい
- 変更履歴をコードレビューしたい

## 採用しない方がよいケース

- 1回限りの小規模手作業で十分
- 運用ルールが未整備でstate管理責任を持てない

## 関連ページ

- [Terraform運用設計ガイド (Azure向け)](./terraform-azure-operations-and-structure-guide/)
- [Terraform実例: Azure App Service + DocumentDB + Foundry 対話システム](./terraform-azure-appservice-documentdb-foundry-chat-example/)

## 参照情報

- Terraform Documentation: https://developer.hashicorp.com/terraform/docs
- Terraform Language: https://developer.hashicorp.com/terraform/language
- Terraform CLI: https://developer.hashicorp.com/terraform/cli/commands
- Terraform State: https://developer.hashicorp.com/terraform/language/state
- Terraform Variables: https://developer.hashicorp.com/terraform/language/values/variables
- Terraform Backend azurerm: https://developer.hashicorp.com/terraform/language/backend/azurerm
- Terraform on Azure (Cloud Shell): https://learn.microsoft.com/en-us/azure/developer/terraform/get-started-cloud-shell-bash
- Store Terraform state in Azure Storage: https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage
- Azure App Service Docs: https://learn.microsoft.com/en-us/azure/app-service/
- Azure Cosmos DB Overview: https://learn.microsoft.com/en-us/azure/cosmos-db/overview
- Microsoft Foundry Overview: https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry

## 追加調査TODO

- AzureRM provider v4系でのFoundry関連リソース対応状況を定期確認する
- Workload Identity Federation前提のCI/CD実装例を別ページで作る
- `tfvars`テンプレート (`dev/stg/prod`) と運用チェックリストをcheatsheet化する
