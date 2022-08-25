let weatherAPIKey = "bf702c7ab17f061e7c5d34ba0bf00a2e";

let weatherBaseEndPoint = "https://api.openweathermap.org/data/2.5/weather?&appid="+weatherAPIKey+"&units=metric";

let forecastBaseEndPoint = "https://api.openweathermap.org/data/2.5/forecast?&appid="+weatherAPIKey+"&units=metric";

let geocodingBasePoint = "http://api.openweathermap.org/geo/1.0/direct?limit=5&appid="+weatherAPIKey+"&q=";

let reverseGeocoding = "http://api.openweathermap.org/geo/1.0/reverse?limit=5&appid="+weatherAPIKey;

let datalist = document.querySelector("#suggestions");
let searchInp = document.querySelector(".weather_search");
let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let temperature = document.querySelector(".weather_temperature>.value");
let image = document.querySelector(".weather_image");
let forecastBlock = document.querySelector(".row");

let weatherImages=[
    {
        url:"images/broken-clouds.png",
        ids:[803,804]
    },
    {
        url:"images/clear-clouds.png",
        ids:[800]
    },
    {
        url:"images/few-clouds.png",
        ids:[801]
    },
    {
        url:"images/mist.png",
        ids:[701,711,721,731,741,751,761,762,781]
    },
    {
        url:"images/rain.png",
        ids:[500,501,502,503,504]
    },
    {
        url:"images/scattered-clouds.png",
        ids:[802]
    },
    {
        url:"images/shower-rain.png",
        ids:[521,520,521,522,531,300,301,302,310,311,312,314,321]
    },
    {
        url:"images/snow.png",
        ids:[511,600,601,602,611,612,613,615,616,620,621,622]
    },
    {
        url:"images/thunderstorm.png",
        ids:[200,201,202,210,211,212,221,231,232]
    }
]


window.onload = function() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            console.log(position);
            let crd = position.coords;
            let lat = crd.latitude.toString();
            let lng = crd.longitude.toString();
            getCityFromLatLon(lat,lng);
        
        });
    } else {
        console.log("NO FOUND");
    }
  };



  let getCityFromLatLon= async(lat,lng)=>{
    let endPoint = reverseGeocoding+"&lat="+lat+"&lon="+lng;
            let response =await fetch(endPoint);
            let latlong =await response.json();
            console.log(latlong);

            latlong.forEach((data)=>{
                console.log(data.name);
                searchInp.value=data.name;
                weatherForCity(searchInp.value);
            });   
  }

let getweatherByCityName=async(city)=>{
    let endPoint = weatherBaseEndPoint+"&q="+city;
    let response = await fetch(endPoint);
    let weather =await response.json();
    //console.log(weather);
    return weather; 
};

let getForecastbycityID=async (id)=>
{
    let endpoint = forecastBaseEndPoint + "&id=" + id;
    let result =await fetch(endpoint);
    let forecast = await result.json();
    console.log(forecast);
    let forcastlist=forecast.list;
    let daily=[];

    forcastlist.forEach((day)=>{
        let date_txt = day.dt_txt;
        date_txt=date_txt.replace(" ","T");

        let date = new Date(date_txt);
        let hours = date.getHours();
        console.log(hours);
        if(hours === 12){
            daily.push(day);
        }
    });

    console.log(daily);
    return daily;

};

let updateCurrentWeather=(data)=>{
    console.log(data);

    //city
    city.innerText=data.name;

    //Day
    day.innerText= dayOfWeek();

    //Humidity
    humidity.innerText = data.main.humidity;

     //Pressure
    pressure.innerText = data.main.pressure;

    //Wind
    let newWind = data.wind.deg;
    wind.innerText = degToCompass(newWind) + " , " + data.wind.speed; 


    //temperature
    temperature.innerText = data.main.temp > 0 ? "+"+ Math.round(data.main.temp) : Math.round(data.main.temp);

    //weathercons
    let imgID = data.weather[0].id;
    weatherImages.forEach((obj)=>{

        if(obj.ids.indexOf(imgID) != -1){
            image.src=obj.url;
        }
    });


    // let winDirection;
    // let deg = data.wind.deg;
    // if(deg>45 && deg<=135){
    //     winDirection="East";
    // } else if(deg>135 && deg<=225){
    //     winDirection="South";
    // } else if(deg>225 && deg<=315){
    //     winDirection="West";
    // } else {
    //     winDirection="North";
    // }

    // wind.innerText = winDirection+" , "+data.wind.speed;


};

function degToCompass(num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

let dayOfWeek=(dt= new Date().getTime())=>{
    // if(dt === undefined) {
    //     dt = new Date().getTime();
    // }
    let today = new Date(dt).toLocaleDateString("en-EN",{weekday:"long"});
    return today;
};

let weatherForCity=async(city)=>{
    let weather = await getweatherByCityName(city);
    if(weather.cod ==="404"){
        Swal.fire({
            title:"OOPs....",
            text:"You Typed Wrong City name",
            icon:"error"
        });
        return;
    }
    updateCurrentWeather(weather);
    let cityID = weather.id;
    let forecast = await getForecastbycityID(cityID);
    updateForecast(forecast);
}

searchInp.addEventListener("keydown", async(e)=>{
    if(e.keyCode===13){

        //console.log("enter pressed"+searchInp.value);
        //let weather =await getweatherByCityName(searchInp.value);
        //console.log(weather);
        weatherForCity(searchInp.value);

        //updateCurrentWeather(weather);

    } 
});

searchInp.addEventListener("input", async ()=>{

    if(searchInp.value.length <= 2) {
        return;
    }
    let endPoint = geocodingBasePoint + searchInp.value;
    let result= await fetch(endPoint);
    result = await result.json();
    console.log(result);
    datalist.innerHTML="";
    result.forEach((city)=>{
        let option = document.createElement("option");
        option.value=`${city.name}${city.state?","+city.state:""},${city.country}`;
        datalist.appendChild(option);
        console.log(`${city.name}${city.state?","+city.state:""},${city.country}`);
    })
})

let updateForecast=(forecast)=>{
    forecastBlock.innerHTML="";
    let forecastItem = "";

    forecast.forEach((day)=>{
        let iconurl="https://openweathermap.org/img/wn/"+ day.weather[0].icon +"@2x.png";
        let tempearature = day.main.temp > 0 ? ""+ Math.round(day.main.temp) : Math.round(day.main.temp);

        let dayName = dayOfWeek(day.dt*1000);
        console.log(dayName);

        forecastItem+=`       
      <div class="col-md-2 text-light shadow-lg my-2 mx-2">
        <div class="weather_forecast_item">
        <h3 class="weather_forecast_day">${dayName}</h3>
        <img
            src="${iconurl}"
            alt="${day.weather[0].description}"
            class="weather_forecast_icon"
          />
          <p class="weather_forecast_temperature">
            <span class="value">+${tempearature}</span> &deg;C
          </p>
        </div>
        </div>`;
    });

    forecastBlock.innerHTML=forecastItem;
}



$(document).ready(function() {
    $(".info").hover(function() {
        Swal.fire({
            title: "<h5 style='color:white'>Made by : Shatakshi Kaushik</h5><h6 style='color:white'> Email id : kaushikshatakshi427@gmail.com</h6>",
            text:"",
            icon:"success"
        });
    }); 
});

// getweatherByCityName("Bhopal");