# Prerequisites to run your own instance of the 
# InterPlanetary Distribution Portal
Start an instance of the [CoinOS server](https://github.com/coinos/coinos-server)

    Create a new user on CoinOS(https://coinos.io) app.
    Once user is created, click on your avatar on the top right and click on settings
    In settings, click on Auth Keys and note your JWT Token

Run the frontend dev server:

    yarn dev

Run the backend containers:

    cd server
    cp .env.sample .env
    edit the .env variable COINOS_TOKEN and set it to your JWT token from the pre-requisites step
    docker-compose up -d
    
Setup pre-commit git hooks:
    
   We have a pre-commit git hook for running prettier on all files to keep the formatting consistent.
    
   `git config core.hooksPath "./git_hooks"` - This will set the git config path to use this directory for hooks.
    
   `chmod +x ./git_hooks/pre-commit` - This will give the hook the necessary permissions to run.
