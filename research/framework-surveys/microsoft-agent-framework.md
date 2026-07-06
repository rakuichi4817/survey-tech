---
title: Microsoft Agent Framework入門
description: Microsoft Agent Frameworkの位置づけ、主要機能、AgentsとWorkflowsの使い分け、導入判断の要点を整理する。
---

# Microsoft Agent Framework入門

## 要約

Microsoft Agent Frameworkは、Pythonと.NETでAIエージェントとマルチエージェントワークフローを構築するためのMicrosoft製フレームワークです。Semantic KernelとAutoGenの後継的な位置づけで、単体エージェント、ツール呼び出し、MCP、会話状態、middleware、telemetry、graph-based workflow、checkpoint、human-in-the-loopをまとめて扱えます。

単なるLLM APIラッパーではなく、エージェントアプリケーションの実行基盤に近い技術です。Azure AI Foundry、Azure OpenAI、OpenAI、Anthropic、Ollamaなどのproviderを扱える一方、LiteLLMのようなLLM Gateway専用の抽象とは責務が異なります。

## 位置づけ

Microsoftの公式説明では、Agent FrameworkはAutoGenのシンプルなエージェント抽象とSemantic Kernelのエンタープライズ機能を統合し、さらに明示的なmulti-agent orchestrationのためのWorkflowsを加えたものです。

主な対象は次のようなアプリケーションです。

- LLMがツールやMCPサーバーを呼び出す対話型エージェント
- 複数エージェントや関数を組み合わせる業務ワークフロー
- 中断、再開、人間承認が必要な長時間実行タスク
- .NETとPythonの両方で共通したエージェント基盤を使いたい業務システム
- Azure AI FoundryやAzure OpenAIを含むMicrosoftエコシステム中心のAIアプリケーション

## 主要機能

### Agents

Agentsは、LLM、instructions、tools、MCP servers、会話状態を持つ個別エージェントです。公式Overviewでは、Microsoft Foundry、Anthropic、Azure OpenAI、OpenAI、Ollamaなどのproviderをサポートすると説明されています。

開放的、会話的、自律的なツール利用を伴うタスクではAgentを使います。ただし公式ドキュメントは「関数で処理できるならAI agentではなく関数を書く」方針も示しており、何でもAgent化する設計は避けるべきです。

### Workflows

Workflowsは、エージェントや関数をgraphとして接続する仕組みです。明確な工程、分岐、並列実行、type-safe routing、checkpoint、human-in-the-loopが必要な場合に使います。

Agentsが「LLMに判断させる会話的な単位」だとすると、Workflowsは「アプリ側が実行順序を明示する工程管理」です。

### 基盤機能

公式Overviewで挙げられている基盤機能は次の通りです。

- model clients: chat completionsやresponsesのモデル呼び出し
- agent session: 状態管理
- context providers: agent memory
- middleware: agent actionsへの割り込みや制御
- MCP clients: 外部ツール統合
- telemetry: OpenTelemetryを含む観測性

## AgentsとWorkflowsの使い分け

| 観点 | Agents | Workflows |
| --- | --- | --- |
| 向くタスク | 会話的、open-ended | 手順が明確 |
| 制御主体 | LLMの判断が大きい | アプリ側の工程定義が大きい |
| 代表用途 | 調査、質問応答、ツール利用 | 承認フロー、複数工程、長時間処理 |
| 状態管理 | sessionやconversation中心 | checkpointやresumeを重視 |
| 失敗時の扱い | middlewareや再実行設計 | graph上の分岐、再開、差し戻し |

## 導入に向くケース

- Azure AI Foundry、Azure OpenAI、.NETを含むMicrosoft系基盤を重視している。
- AutoGenまたはSemantic Kernel由来の設計資産がある。
- 複数エージェント、workflow、checkpoint、人間承認、telemetryを標準機能として使いたい。
- Pythonと.NETの両方で類似のエージェント基盤を使いたい。
- 独自実装が大きくなり、チーム内フレームワーク化し始めている。

## 注意点

- Agent FrameworkはLLM Gateway専用ではないため、LiteLLMのようなマルチベンダー統一、予算、ルーティング、フォールバック中心の基盤とは責務が違う。
- LiteLLM Gatewayと併用する場合、provider責務とgateway責務を二重化しない設計が必要。
- 実行ループ、状態、tool callingの作法がフレームワークに寄るため、低レベル制御を重視する用途ではPoCで確認したい。
- Third-party systemsやnon-Azure direct modelsを扱う場合のデータ共有、コスト、責任範囲は利用者側で確認する必要がある。
- 2026年時点でもAPI、サンプル、providerごとの差異、移行ガイドの成熟度は継続確認が必要。

## LiteLLMとの関係

LiteLLMはモデル接続、OpenAI互換Gateway、ルーティング、フォールバック、コスト管理、管理UIなど、LLM呼び出しの統一に強い技術です。一方、Microsoft Agent FrameworkはAgent、Workflow、session、middleware、telemetryなど、エージェントアプリケーションの実行基盤に寄っています。

併用する場合は、次のように責務を分けるのが現実的です。

- LiteLLM: model gateway、vendor switching、cost、budget、fallback
- Agent Framework: agent loop、workflow、checkpoint、human-in-the-loop、telemetry
- アプリ固有層: 権限、監査、成果物管理、業務ルール、セキュリティ境界

## 関連ページ

- [LiteLLM中心設計と高級エージェントフレームワークの採用判断](./agent-framework-low-level-vs-high-level.md)

## 参照情報

- Microsoft Agent Framework documentation: https://learn.microsoft.com/en-us/agent-framework/
- Microsoft Agent Framework Overview: https://learn.microsoft.com/en-us/agent-framework/overview/
- Microsoft Agent Framework GitHub: https://github.com/microsoft/agent-framework
- agent-framework PyPI: https://pypi.org/project/agent-framework/
- Semantic Kernel GitHub: https://github.com/microsoft/semantic-kernel
- AutoGen documentation: https://microsoft.github.io/autogen/stable/

## 追加調査TODO

- Microsoft Agent FrameworkでLiteLLM GatewayをOpenAI互換endpointとして使う具体例を検証する。
- providerごとのtool calling、structured output、streaming対応差を確認する。
- Python版と.NET版で機能差、命名、サンプルの充実度に差がないか確認する。
- AutoGen/Semantic Kernelからの移行ガイドを読み、既存資産がある場合の移行コストを整理する。
