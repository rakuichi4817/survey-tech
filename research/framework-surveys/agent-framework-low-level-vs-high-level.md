---
title: LiteLLM中心設計と高級エージェントフレームワークの採用判断
description: LiteLLMのようなローレベルLLM基盤と、Microsoft Agent Framework、LangGraph、OpenAI Agents SDKなどの高級エージェントフレームワークを比較し、ソフトウェア開発用途での採用判断を整理する。
---

# LiteLLM中心設計と高級エージェントフレームワークの採用判断

## 要約

現在LiteLLMを使ってマルチベンダー対応をしており、「なるべくローレベルなライブラリを使って自分たちで管理したい」という意図があるなら、基本方針は妥当です。LiteLLMはLLM呼び出し、モデル差し替え、ルーティング、フォールバック、コスト管理、Proxy/Gatewayに強く、アプリ固有の状態管理、ツール実行、権限管理、評価、監査を自前設計しやすいです。

Microsoft Agent Frameworkのような高級エージェントフレームワークは、エージェント、ツール、会話状態、ワークフロー、チェックポイント、human-in-the-loop、OpenTelemetryなどをまとめて提供します。複数エージェントの協調、長時間実行、再開可能なワークフロー、運用観測性が必要になった段階では有力です。

結論として、ソフトウェア開発支援エージェントを作る場合は、まずLiteLLM中心の薄い自前オーケストレーションで始め、状態遷移・再開・人間承認・マルチエージェント協調が複雑化した時点で、LangGraphまたはMicrosoft Agent FrameworkをPoCするのが現実的です。最初から高級フレームワークへ全面移行する必要性は低いです。

## 解決する課題

Agent Frameworkや周辺のエージェントフレームワークは、単なるLLM API呼び出しではなく、次のような「エージェントアプリケーションの実行基盤」を提供します。

- ツール呼び出しループの実装
- 会話履歴、短期メモリ、長期メモリの管理
- 複数エージェントの役割分担、handoff、group chat
- ワークフローの明示的な分岐、並列実行、再開
- human-in-the-loopの承認や介入
- トレース、評価、デバッグ、監視
- MCP、A2A、外部ツール、ホスト環境との統合

ソフトウェア開発用途では、これに加えて次の課題があります。

- ファイルシステム、Git、シェル実行など危険なツールの権限管理
- 長い作業を途中で止めて再開する実行状態の永続化
- LLMの失敗、ツール失敗、部分完了を扱うリカバリ設計
- コード生成結果の検証、テスト、レビュー、差分管理
- モデルやベンダー差し替え時の品質差、ツール呼び出し差の吸収

## 主要概念

### LiteLLM中心のローレベル構成

LiteLLMは100以上のLLMプロバイダーをOpenAI互換形式で呼び出すためのライブラリおよびGatewayです。Python SDKでは`completion()`、embedding、画像生成などを統一インターフェースで扱えます。Proxy Serverを使うと、OpenAI互換クライアントからLiteLLM Gatewayへ接続し、仮想キー、予算、コスト追跡、管理UI、ガードレール、キャッシュなどを中央集約できます。

この構成では、エージェントの実行ループ、ツールディスパッチ、状態管理、リトライ、権限制御、評価、監査ログは自分たちで設計します。抽象化は薄い一方、アプリの実行モデルを細かく制御できます。

### Microsoft Agent Framework

Microsoft Agent Frameworkは、Pythonと.NET向けのエージェントおよびマルチエージェントワークフロー構築フレームワークです。詳細な概要、AgentsとWorkflowsの使い分け、LiteLLMとの責務分担は [Microsoft Agent Framework入門](./microsoft-agent-framework.md) に分けています。

### LangGraph

LangGraphは、長時間実行、状態ful、再開可能なエージェントワークフロー向けの低レベルオーケストレーションフレームワークです。公式ドキュメントでも「very low-level」「agent orchestrationに集中」と説明されています。プロンプトやエージェント設計を隠蔽しにくく、永続化、human-in-the-loop、ストリーミング、状態遷移の制御に強いです。

### OpenAI Agents SDK

OpenAI Agents SDKは、Agent、handoff、guardrails、sessions、MCP、tracingなどを少数のプリミティブで扱う軽量なSDKです。OpenAIモデルを中心に使う場合は導入しやすいですが、LiteLLM前提のマルチベンダー設計では、OpenAI固有機能への依存が増えないか確認が必要です。公式にはLiteLLM provider拡張も用意されています。

### LlamaIndex Agents

LlamaIndexのAgent機能は、RAG、index、retriever、query engineとの統合が強みです。ドキュメント検索、社内ナレッジ、コードベース検索など、情報検索を中心としたエージェントには向いています。一方、汎用的なソフトウェア開発エージェントの実行基盤として使う場合は、RAG寄りの抽象が過剰になることがあります。

### CrewAI / AutoGen

CrewAIは、agents、crews、flows、tasks/processesを中心に、役割分担型のマルチエージェント自動化を組みやすくします。AutoGenはMicrosoftのマルチエージェントフレームワークで、AgentChat、Core、Extensions、Studioを持ちます。ただしMicrosoft Agent FrameworkがSemantic KernelとAutoGenの後継として説明されているため、新規採用ではMicrosoft Agent Frameworkも候補に入れるべきです。

## 比較表

| 観点 | LiteLLM中心の自前実装 | Microsoft Agent Framework | LangGraph | OpenAI Agents SDK | LlamaIndex Agents | CrewAI / AutoGen |
| --- | --- | --- | --- | --- | --- | --- |
| 抽象度 | 低い | 中から高 | 中、ただし orchestration は低レベル | 中 | 中から高 | 高め |
| 主な役割 | LLM Gateway/SDK | エージェントとワークフロー基盤 | 状態fulワークフロー基盤 | 軽量エージェントSDK | RAG連携エージェント | 役割分担型マルチエージェント |
| マルチベンダー | 強い | 対応あり、範囲確認が必要 | 任意のモデル層を接続可能 | OpenAI中心、拡張で対応 | 多数連携あり | 連携はあるが抽象に依存 |
| 状態管理 | 自前 | session、checkpoint等あり | persistence/checkpointが強い | sessionsあり | memoryあり | memory/flowあり |
| ツール実行制御 | 自前で完全制御 | frameworkの作法に乗る | 自前制御しやすい | SDK管理 | LlamaIndex流 | framework管理 |
| 長時間実行 | 自前 | workflows/checkpointing | 強い | sandbox/session等あり | 用途次第 | flows等あり |
| 観測性 | LiteLLM callback/Proxy、自前 | OpenTelemetry | LangSmith前提が強いが自前も可 | tracingあり | callbacks/instrumentation | platform寄り |
| 学習コスト | 自前設計の負担大 | 中 | 中から高 | 低から中 | 中 | 低から中 |
| ロックイン | 低い | 中 | 中 | OpenAI寄り | LlamaIndex寄り | CrewAI/AutoGen寄り |
| ソフトウェア開発エージェント適性 | 高いが実装負担あり | 高い可能性あり | 高い | OpenAI中心なら高い | RAG中心なら高い | プロトタイプ向き |

## メリット

### LiteLLM中心のメリット

- ベンダー差し替えがしやすい。
- API呼び出し、コスト、フォールバック、ルーティングを自分たちのポリシーで管理できる。
- エージェント実行ループをブラックボックス化しにくい。
- ファイル操作、シェル実行、Git操作など、ソフトウェア開発特有の危険なツールに独自の権限制御を入れやすい。
- フレームワークの設計思想にアプリ構造を合わせる必要が少ない。
- 将来、必要な部分だけLangGraphやAgent Frameworkに差し替えやすい。

### 高級エージェントフレームワークのメリット

- ツール呼び出し、会話状態、handoff、複数エージェント協調を短く実装できる。
- checkpoint、human-in-the-loop、workflow、tracingなど、運用時に必要になる機能が最初からある。
- チーム内でエージェント設計の共通語彙を作りやすい。
- サンプルや既存パターンを流用でき、PoCが速い。
- OpenTelemetryやLangSmithなどの観測基盤に乗せやすい。

### Microsoft Agent Frameworkのメリット

- Pythonと.NETの両方で使えるため、.NET資産やAzure中心の組織では採用しやすい。
- AgentとWorkflowが分かれており、会話的タスクと明示的な工程管理を使い分けられる。
- Semantic KernelとAutoGenの後継という位置づけで、Microsoft系エコシステムでの将来性がある。
- Azure AI Foundry、Azure OpenAI、OpenAI、Anthropic、Ollamaなどのproviderに対応している。
- middleware、telemetry、session、type-safe routingなど、業務アプリ向けの土台がある。

## デメリット

### LiteLLM中心のデメリット

- エージェントループ、ツール呼び出し、状態遷移、再開処理を自前で実装する必要がある。
- 実装品質がチームの設計力に依存する。
- トレース、評価、デバッグUI、可視化を個別に組み合わせる必要がある。
- マルチエージェントや長時間実行が増えると、独自フレームワーク化しやすい。
- プロンプト、ツール、モデル、状態の境界設計を間違えると保守が難しくなる。

### 高級エージェントフレームワークのデメリット

- 実行ループや状態管理がフレームワークの都合に寄りやすい。
- デバッグ時に「なぜそのツールを呼んだか」「どこで状態が変わったか」が追いにくくなる場合がある。
- モデルごとのtool calling差、streaming差、JSON/schema差をフレームワークがどこまで吸収するかに依存する。
- バージョンアップで抽象や推奨パターンが変わるリスクがある。
- 単純なユースケースでは、導入した概念のほうが複雑になる。

### Microsoft Agent Frameworkの注意点

- Microsoft/Azureエコシステムとの相性が強みである一方、非Azure中心の運用でどれだけ軽量に使えるかはPoCで確認が必要。
- provider supportはあるが、LiteLLMほど「LLM Gatewayとしてのマルチベンダー統一」に特化しているわけではない。
- Agent FrameworkとLiteLLMの責務が重なる部分があるため、両方を厚く使うと抽象が二重になる。
- AutoGen/Semantic Kernelからの移行文脈が強いため、新規設計ではドキュメント、サンプル、APIの成熟度を確認したい。

## 採用に向くケース

### LiteLLM中心を維持するケース

- マルチベンダー対応を最重要視する。
- モデル選択、fallback、rate limit、cost、budgetをアプリ横断で統制したい。
- ソフトウェア開発支援のように、ツール権限と副作用を厳密に管理したい。
- エージェントの判断より、明示的な状態機械やジョブキューで制御したい。
- まだ単一エージェント、短時間タスク、明確なツール呼び出しが中心である。
- 将来のフレームワーク乗り換え余地を残したい。

### Microsoft Agent Frameworkを検討するケース

- Azure AI Foundry、Azure OpenAI、.NET、Microsoft系基盤を重視している。
- AutoGenやSemantic Kernel由来の設計資産がある。
- 複数エージェント、workflow、checkpoint、人間承認、telemetryをまとめて導入したい。
- プロダクション運用で、フレームワーク提供の標準パターンに乗るメリットが大きい。
- Pythonと.NETの両方で類似のエージェント基盤を使いたい。

### LangGraphを検討するケース

- 高級なagent abstractionより、状態遷移と永続化を細かく制御したい。
- 「低レベル志向」は維持したまま、長時間実行やhuman-in-the-loopだけを補強したい。
- グラフ構造、checkpoint、resume、interruptを明示的に扱いたい。
- LiteLLMをモデル層として残し、オーケストレーションだけ導入したい。

### OpenAI Agents SDKを検討するケース

- OpenAI Responses API、tracing、Realtime、sandbox agentsを中心に使う。
- OpenAIモデルが主力で、マルチベンダーは補助的でよい。
- 少数のプリミティブで素早くエージェントを作りたい。

### LlamaIndex Agentsを検討するケース

- コードベース検索、ドキュメント検索、社内ナレッジ検索などRAGが中心である。
- index、retriever、query engineをすでにLlamaIndexで組んでいる。
- エージェントは検索や情報統合の上に載せる補助的な役割である。

## 採用しない方がよいケース

### 高級フレームワークを避けた方がよいケース

- LLM呼び出しが単純なチャット補助、要約、分類、抽出に近い。
- 実行順序を完全にアプリ側で制御したい。
- モデル差し替え、ベンダー差し替え、コスト最適化が最優先である。
- フレームワークの隠れた状態管理を許容できない。
- チームがまだエージェント設計の失敗パターンを十分に理解していない。
- トラブル時に低レベルログと差分から原因追跡する運用を重視する。

### LiteLLMだけでは厳しくなるケース

- 数十ステップ以上の長時間実行タスクが増える。
- 途中承認、停止、再開、差し戻しが必要になる。
- 複数エージェントのhandoffや並列作業を安定運用したい。
- 実行状態の可視化やトレースなしではデバッグできない。
- 独自オーケストレーション層が大きくなり、チーム内フレームワーク化してきた。

## 代替案

### 案1: LiteLLM + 薄い自前ランタイム

最も現在の意図に合います。LiteLLMでモデル呼び出しを統一し、アプリ側に薄いランタイムを作ります。

自前ランタイムが持つべき最小要素は次です。

- `Run`: 1つの作業単位
- `Step`: LLM呼び出し、tool call、validation、test、reviewなどの工程
- `Tool`: 実行権限、入力schema、出力schema、timeout、監査ログを持つ
- `State`: messagesだけでなく、作業対象、成果物、エラー、承認状態を保存する
- `Policy`: モデル選択、最大コスト、最大ツール回数、危険操作の承認条件
- `Trace`: LLM input/output、tool input/output、差分、テスト結果を保存する

### 案2: LiteLLM + LangGraph

低レベル志向を保ちつつ、状態ful workflowとcheckpointを導入できます。モデル層はLiteLLMに寄せ、LangGraphは状態遷移・中断・再開に限定します。

### 案3: LiteLLM Gateway + OpenAI Agents SDK

OpenAI Agents SDKのLiteLLM provider拡張やOpenAI互換Gatewayを使う構成です。短期のPoCは速いですが、OpenAI固有機能への依存度を確認する必要があります。

### 案4: Microsoft Agent Framework中心

Azure/.NET/Foundryを含む業務基盤として標準化するなら候補です。ただし、LiteLLMのGateway責務とAgent Frameworkのprovider責務を二重化しないように設計します。

### 案5: 用途別に併用

全機能を1つのフレームワークに寄せず、用途で分けます。

- モデルGateway: LiteLLM
- 長時間・状態ful workflow: LangGraphまたはMicrosoft Agent Framework Workflows
- RAG/検索: LlamaIndex
- OpenAI固有機能: OpenAI Agents SDK
- 低リスクな業務自動化PoC: CrewAI

## PoC案

### PoC 1: LiteLLM自前ランタイムの基準実装

目的は「高級フレームワークなしで、どこまで安全に保守できるか」を確認することです。

検証内容:

- 1つの開発タスクを`Run`として保存する
- LLM呼び出しをLiteLLM経由に統一する
- tool callを明示的にdispatchする
- ファイル編集、テスト実行、Git差分確認を別Toolとして管理する
- 各Stepの入出力、コスト、モデル、エラーを保存する
- 途中失敗時に同じRunから再開できるか確認する

成功条件:

- デバッグに必要なログが残る
- 危険なツール呼び出しをpolicyで止められる
- モデルをOpenAI、Anthropic、Azure OpenAIなどに差し替えてもアプリコードが大きく変わらない
- 独自コードが過剰に肥大化していない

### PoC 2: LiteLLM + LangGraph

目的は「低レベル制御を保ちながら、checkpointとhuman-in-the-loopを導入できるか」を確認することです。

検証内容:

- `plan -> edit -> test -> review -> finalize`をグラフ化する
- `test`失敗時に`edit`へ戻す
- 危険な編集やコマンドの前にhuman approvalを挟む
- checkpointから再開する
- LLM呼び出しはLiteLLMのまま維持する

### PoC 3: Microsoft Agent Framework

目的は「Agent Frameworkに寄せる価値が、抽象化コストを上回るか」を確認することです。

検証内容:

- 単一Agentに開発補助ツールを持たせる
- Workflowで`調査 -> 実装 -> テスト -> レビュー`を接続する
- checkpoint、middleware、telemetryを試す
- LiteLLM Gatewayを使う場合と、Agent Frameworkのproviderを直接使う場合を比較する
- Azure/OpenAI以外のproviderでtool calling差が問題にならないか確認する

### PoC 4: OpenAI Agents SDK

目的は「OpenAI中心の軽量SDKで十分か」を確認することです。

検証内容:

- function tool、handoff、guardrails、tracingを試す
- LiteLLM provider拡張またはLiteLLM Gateway経由で非OpenAIモデルを呼ぶ
- OpenAI固有のtracingやResponses API依存が許容できるか確認する

## 採用判断

現時点の推奨は「LiteLLM中心を維持し、高級フレームワークは全面採用せず、必要な問題が出た箇所だけPoCする」です。

理由は次の通りです。

- ユーザーの意図である「ローレベルなライブラリを使って管理したい」とLiteLLMは合っている。
- ソフトウェア開発エージェントでは、ファイル編集、コマンド実行、Git操作など副作用が強いため、実行ループを自分たちで把握できる価値が高い。
- LiteLLMはモデル呼び出し層として明確な責務を持ち、高級フレームワークよりロックインが少ない。
- 高級フレームワークを入れるなら、抽象化そのものではなく、checkpoint、human-in-the-loop、workflow、observabilityなど具体的な不足を埋める目的に限定した方がよい。

採用判断の目安:

| 状況 | 推奨 |
| --- | --- |
| 単一エージェント、短時間タスク、明示的ツール実行 | LiteLLM + 自前ランタイム |
| 長時間実行、再開、承認、状態遷移が複雑 | LiteLLM + LangGraphをPoC |
| Azure/.NET/Foundryを含めて標準化したい | Microsoft Agent FrameworkをPoC |
| OpenAIモデルとResponses API中心 | OpenAI Agents SDKをPoC |
| RAG、コード検索、ドキュメント検索中心 | LlamaIndex AgentsをPoC |
| 役割分担型の業務自動化を素早く試したい | CrewAIまたはAutoGenをPoC |

最終的には、次の境界を守るのが重要です。

- LiteLLMは「モデル接続、Gateway、コスト、ルーティング」の責務に寄せる。
- アプリの「実行権限、状態、監査、成果物管理」は自前の明示的な層に置く。
- フレームワークを入れる場合は「実行状態とワークフロー」など限定した責務で導入する。
- 1つのフレームワークにモデルGateway、agent loop、workflow、RAG、observabilityを全部任せない。

## 実装時の設計メモ

LiteLLM中心で進める場合、最初から次を決めておくと後で高級フレームワークへ移行しやすいです。

- LLM呼び出しのinterfaceをアプリ内で1つにする。
- message履歴だけを状態にせず、作業計画、成果物、tool result、検証結果を構造化して保存する。
- toolはPython関数を直接LLMに渡すのではなく、schema、permission、timeout、side effect、audit logを持つオブジェクトとして扱う。
- モデル選択はprompt内ではなくpolicyで決める。
- tool callの最大回数、最大コスト、最大実行時間をRun単位で制限する。
- LLM出力をそのまま実行せず、必ずvalidate stepを挟む。
- ファイル編集、シェル実行、ネットワークアクセスは別権限にする。
- tracingは「LLM」「tool」「state transition」「artifact diff」を分けて残す。

## 関連ページ

- [Microsoft Agent Framework入門](./microsoft-agent-framework.md)

## 参照情報

- Microsoft Agent Framework documentation: https://learn.microsoft.com/en-us/agent-framework/
- Microsoft Agent Framework Overview: https://learn.microsoft.com/en-us/agent-framework/overview/
- Microsoft Agent Framework GitHub: https://github.com/microsoft/agent-framework
- agent-framework PyPI: https://pypi.org/project/agent-framework/
- LiteLLM documentation: https://docs.litellm.ai/docs/
- LiteLLM GitHub: https://github.com/BerriAI/litellm/
- LangGraph overview: https://docs.langchain.com/oss/python/langgraph/overview
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/
- OpenAI Agents SDK LiteLLM provider reference: https://openai.github.io/openai-agents-python/ref/extensions/models/litellm_provider/
- LlamaIndex Agents: https://docs.llamaindex.ai/en/stable/module_guides/deploying/agents/
- CrewAI documentation: https://docs.crewai.com/
- AutoGen documentation: https://microsoft.github.io/autogen/stable/

## 追加調査TODO

- Microsoft Agent FrameworkでLiteLLM GatewayをOpenAI互換endpointとして使う具体例を検証する。
- Microsoft Agent Frameworkのproviderごとのtool calling、structured output、streaming対応差を確認する。
- LiteLLM Agent Platform、A2A Gateway、MCP Gatewayの成熟度とOSS/Enterprise境界を確認する。
- LangGraphとLiteLLMを組み合わせた最小実装を作り、checkpointとhuman-in-the-loopの実装量を測る。
- OpenAI Agents SDKのLiteLLM providerでAnthropic、Azure OpenAI、Vertex AIを呼んだ場合の制約を確認する。
- ソフトウェア開発エージェント用に、ファイル編集・シェル実行・Git操作の権限モデルを別途設計する。
