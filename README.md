# sonolus-uploader-core2 (backend for sonolus)
Another public [sonolus](https://sonolus.com/) server api to manage user generated levels. Other contents can be added by directly put into db/source folder and sonolus-packing.

## Objectives
I made [sonolus-uploader-core](https://github.com/PurplePalette/sonolus-uploader-core) before. But it was highly depended on firebase, and hard to change sonolus resources. Also when we run it on production, it was easy to make bandwidth cost too much. So I isolated firebase as possible as I can. Now it just requires firebase-admin to authorization. Biggest change is now resources are just placed as files. Wow, it's really simple!

Note: As [I](https://github.com/PurplePalette/sonolus-uploader-core) and [burrito](https://github.com/NonSpicyBurrito/sonolus-express-demo-memory) said, this is not recommended to big community. Just for starting a new sonolus server.

## Features
- Users can upload files from API.
- Users can upload new level, update level, and delete level. (sure it needs authorization)
- Admins can add/edit/remove engines, backgrounds, effects, particles, and skins with just put to folder (also need sonolus-pack)

## Strategy
- Database is folder-structure based on this server.
- Easy maintainable to newbies.

## Running Requirements
- Node.js
  - This project targets Node.js 14. Not tested in other versions.
- Firebase Authorization
  - This api depends it to verify the user.
- Memory
  - This api keeps the whole database on memory.
  - I recommend bigger memory, if you try to make big community.
- Storage
  - This api saves entire files in db folder.
  - I recommend bigger storage, if you try to make big community.

## Installation
```
(Install node.js 14.X)
npm install -g yarn
git clone -b main https://github.com/PurplePalette/sonolus-uploader-core2
cd sonolus-uploader-core2
yarn install
(Open config.ts and change config to your own)
(Remove examples and add your own files to db/source)
yarn run pack
yarn run start
(Now you can access your server from sonolus client!)
```

## Sonolus Links
- [sonolus-express (server toolkit written in express.js + typescript)](https://github.com/NonSpicyBurrito/sonolus-express)
- [sonolus-express-demo-memory (example of sonolus-express)](https://github.com/NonSpicyBurrito/sonolus-express-demo-memory)
- [sonolus-pack (content packer)](https://github.com/NonSpicyBurrito/sonolus-pack)
- [performance-test server (examples used in this repo)](https://servers.sonolus.com/performance-test/)
- [official website](https://sonolus.com/)
- Thanks to (NonSpicy)Burrito to awesome projects!

## License
GPL

## Powered by OpenAPI
The client requests to this server is validated with by the [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator) project. By using the [OpenAPI-Spec](https://github.com/OAI/OpenAPI-Specification) from a remote server, you can easily generate a client. To see how to make this your own, look these: [README](https://openapi-generator.tech) / [ServerSpec](https://github.com/PurplePalette/sonolus-uploader-core2/blob/dev/api.yaml)
- API version: 1.0
- For more information, please visit [https://discord.gg/KEfVkfC6Q9](https://discord.gg/KEfVkfC6Q9) and ask to お窓
