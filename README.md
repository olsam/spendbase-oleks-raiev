## Installing and Running Application

### Clone this repository
```bash
$ git clone git@github.com:olsam/spendbase-oleks-raiev.git
```

### CD into application directory
```bash
$ cd spendbase-oleks-raiev
```

### Set correct Api Key
Edit .env file in the root of the project. Set value of `API_Key` environment variable.

### Start the application by building and running docker containers 
```bash
$ docker compose up
```

### Run the migrations
Might need to do this in another terminal window/tab
```bash
$ docker exec -it api npm run migration:run
```

## API Endpoints

### Create endpoint
POST localhost:3000/weather

Body:
```
{
    "lat": decimal (-90; 90),
    "lon": decimal (-180; 180),
    "part": "forecast"|"weather",
}
```

### Get endpoint
GET localhost:3000/weather?lat={{decimal (-90; 90)}}&lon={{decimal (-180; 180)}}&part={{forecast|weather}}
