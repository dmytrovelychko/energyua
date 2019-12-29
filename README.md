## Description
Landing page for energy ua company based on [keystone.js](https://www.keystonejs.com/)

### Development

1. Create .env file in project root:
    ```
    COOKIE_SECRET=<secret used to encrypt cookie>
    CLOUDINARY_URL=<your cloudinary project url> // comes from cloudinary account
    ```
2.  Db setup
    1) Prepare mongodb data dump from prod
 
        `mongodump -v --host localhost:27017 --out /home/eua -d energy-ua`
    2) Copy dump dir to dev host
        
        `scp -r eua@energy.ua:<dump_host_dir> /some/local/directory`
    3) Replace db with version from dump
    
        `mongorestore --host <user>:<pass>@localhost:27017 --drop -d <db_name_to_replace> <path_to_dump_folder>`

    4) Configure keystone connect to mongo inside docker container
        uncomment line in keystone.js:
        
        `'mongo':'mongodb://root:example@localhost:27017/energy-ua'`

3. `npm start`

### Deployment
// TODO
