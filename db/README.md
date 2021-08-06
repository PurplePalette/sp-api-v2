# DB
This folder is for serving sonolus entities.
All endpoints excepts `/levels` uses `/pack` folder.

## Directories
### source
engines/backgrounds and other assets will be stored here.

### pack
sonolus-packed source files will be stored here. (DON'T EDIT DIRECTLY)

### users
User data will be stored here. (Since we only use firebase to authorization, no credentials will get stored.)

### levels
Levels will be stored here. (To make levels addable and editable, it's not handled by sonolus-pack)

## Sonolus-Pack Steps
### 1 Input source files to source folder.
Read [sonolus-pack doc](https://github.com/NonSpicyBurrito/sonolus-pack) carefully, and put your engine and other files to the folder.

### 2 Run sonolus-pack at this directory.
After putting all files `excepts levels` to source folder, run `sonolus-pack` at this directory.

### 3 Now you'll see `db.json` in `/pack` folder.
If all files are valid, you'll see `db.json` in `/pack` folder.

### 4 Ready to start server
After restarting server, you'll see new contents when access from sonolus client.