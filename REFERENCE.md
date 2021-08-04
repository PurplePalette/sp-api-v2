# Reference
At here, we put references. Since common member is japanese, almost all references are japanese, sorry.  
ここに参考にした記事を載せていきます。ほぼ日本語の記事になると思います。

## Setup Express.js with TypeScript
https://qiita.com/zaburo/items/69726cc42ef774990279


### yarnを使っている場合
	ts-nodeをインストールする:
	 yarn install ts-node --global
	パッケージ追加:
	 yarn add パッケージ名
	(開発時用)パッケージ追加:
	 yarn add --dev パッケージ名
	TSConfig初期化:
	 yarn tsc --init`
https://qiita.com/rubytomato@github/items/1696530bb9fd59aa28d8

## Setup Express.ts hot-reload
	Development起動
	 yarn run dev
	Production起動
	 yarn run start
	ESLint起動(恐らくはVSCode等から呼ぶ)
	 yarn run lint
	 yarn run eslint
	 yarn run eslint:fix
https://ryotarch.com/javascript/nodejs/ts-node-dev/

## ES6(ES2015)とはなにか
https://qiita.com/soarflat/items/b251caf9cb59b72beb9b
普段使っているのがES6=ES2015。

## Expressでの 静的ファイルディレクトリ
https://expressjs.com/ja/starter/static-files.html

## Node.jsでのフォルダ作成
https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js

## ESLintの導入
https://qiita.com/notakaos/items/85fd2f5c549f247585b1
https://github.com/PurplePalette/sonolus-uploader/blob/main/.eslintrc.js

### エラー "parserOptions.project" has been set for @typescript-eslint/parser. The file does not match your project config
https://github.com/typescript-eslint/typescript-eslint/issues/967
https://wonwon-eater.com/ts-eslint-import-error/

## Multerの導入
https://tech.chakapoko.com/nodejs/express/upload.html
https://codingshiksha.com/javascript/node-js-multer-file-upload-type-validation-filters-and-limit-file-size-and-error-handling-using-express-full-tutorial-for-beginners-with-examples/
https://github.com/expressjs/multer

### CB(callback)は不詳...
https://stackoverflow.com/questions/55925522/what-is-cb-in-multer