# sonolus-uploader-core2 (Sonolus用バックエンドAPI)
[Sonolus](https://sonolus.com/) という音楽ゲームで要求されるサーバーを実装するAPIです。ユーザーがlevelを投稿できる他、background, effect, engine, level, particle, skinを管理者が簡単に管理できるという特徴があります。正しいファイルが揃っていればSonolusクライアントから読み出して遊ぶことができます。

## 目的
以前、 [sonolus-uploader-core](https://github.com/PurplePalette/sonolus-uploader-core) を作り実際に利用しました。実際利用したところ、Firebaseに依存しすぎて動作検証が困難であったり、一度入力したリソースの差し替えが非常に手間がかかるという問題に直面しました。さらにはFirebase Storageにファイルを保存する前提の設計だったため、転送コストがあまりにも高くなりすぎて維持に天文学的な価格がかかってしまうという問題がありました。そこで、Firebaseに依存しない形で書き直し、単にfirebase-adminでユーザー認証を行うだけというものに変更しました。一番大きな変更点は、リソースが単にファイル単位で保存されるようになったことです。db/sourcesにファイルを配置したら、あとは起動するだけです! まぁ簡単!

注意: 以前にも書かれているように、DBがメモリ内にまるごと格納されて稼働するためサーバー大規模になればなるほど、大容量のメモリが必要となります。メモリに乗り切らないほど巨大になる予定がある場合、MySQL等データベースサーバーを使用するよう書き換えてください。

## 特徴
- ユーザーがlevelを投稿できる
- ユーザーが投稿した譜面をあとから編集/削除できる
- 譜面以外の前提ファイルは、管理者が単にフォルダに入れるだけで 簡単に管理できる (変更後はsonolus-packで再構成が必要)

## 戦略
- ファイルベースのデータベース
- 誰にでも簡単に構成できるサーバー

## 要求環境
- Node.js 14
  - 14以外では未検証です
- Firebase Authorization
  - ユーザー認証に使用します
    - ユーザーに譜面を投稿させたくない場合は 未設定でも構いません
- メモリ
  - データベース全体がメモリに乗るため それなりの大きさが必要と考えられます
- ストレージ
  - すべてのファイルがdbフォルダに保存されます

## インストール手順
```
(node.js 14.X をインストール)
npm install -g yarn
git clone -b main https://github.com/PurplePalette/sonolus-uploader-core2
cd sonolus-uploader-core2
yarn install
(config.ts を開いて 任意の設定を入力)
(不要ならdb/source内のサンプルファイルを削除)
yarn run pack
yarn run start
(Sonolusクライアントからアクセス!)
```

## ライセンス
GPL

## Sonolus Links
- [sonolus-express (express.js + typescriptの サーバーツールキット)](https://github.com/NonSpicyBurrito/sonolus-express)
- [sonolus-express-demo-memory (sonolus-expressの使用例)](https://github.com/NonSpicyBurrito/sonolus-express-demo-memory)
- [sonolus-pack (sonolus-expressと併用可能なコンテンツパッカー)](https://github.com/NonSpicyBurrito/sonolus-pack)
- [performance-test server (このリポジトリで使用したサンプルファイル)](https://servers.sonolus.com/performance-test/)
- [公式サイト](https://sonolus.com/)
- Thanks to (NonSpicy)Burrito to awesome projects!

## Powered by OpenAPI
[express-openapi-validator](https://github.com/cdimascio/express-openapi-validator) を利用して、クライアントからAPIへのリクエストがバリデーションされています。 [OpenAPI-Spec](https://github.com/OAI/OpenAPI-Specification) を利用して、対応するクライアントを作ることで、バリデーションエラーを吐かれないクライアントを簡単に作ることができます。 詳しくはこちらをご覧ください: [README](https://openapi-generator.tech) / [ServerSpec](https://github.com/PurplePalette/sonolus-uploader-core2/blob/dev/api.yaml)
- API version: 1.0
- 詳しくは [https://discord.gg/KEfVkfC6Q9](https://discord.gg/KEfVkfC6Q9) の お窓までご連絡を。
