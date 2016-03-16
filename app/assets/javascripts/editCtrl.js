(function() {
  "use strict";

  angular.module("app").controller("editCtrl", function($scope, $http) {

    var userId = gon.user_id;

    $scope.setUpCharts = function() {
      $http.get('/api/v1/footprints/:id.json').then(function(response) {
          var pieData = response.data;
          $scope.drawPieChart(pieData);
      });
    };

    $scope.init = function() {
        $scope.setUpCharts();
        $scope.content = "pie";
        $scope.resultsVisible = false;
        $scope.modalVisible = true;
        $scope.totalSaved = 0;
        $scope.introInstructions = true;
       
        $scope.pills = [
            { name: "intro", visible: true },
            { name: "vehicle", visible: true },
            { name: "air", visible: true },
            { name: "electricity", visible: true },
            { name: "heat", visible: true },
            { name: "home", visible: true },
            { name: "food", visible: true },
            { name: "review", visible: true }
        ];

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
    };

// ---------- SUBMIT FOOTPRINT ---------------------- 

    $scope.submitProfile = function() {
        $http.get('/api/v1/footprints.json').then(function(response) {
            var barData = response.data;
            $scope.drawBarChart(barData);
        });

        $http.get('/api/v1/footprints/:id.json').then(function(response) {
            var pieData = response.data;
            $scope.drawPdfChart(pieData);

            var gas = pieData["saved_gas"].toFixed(2);
            var bike = pieData["bike"].toFixed(2);
            var light = pieData["lightbulb"].toFixed(2);
            var veg = pieData["veg"].toFixed(2);


            $scope.actions = [
                {
                    name: "gas",
                    caption: " Buy a more fuel efficient vehicle", 
                    value: gas 
                }, {
                    name: "bike",
                    caption: " Ride your bike 20 miles a week", 
                    value: bike
                }, {
                    name: "lightbulb",
                    caption: " Replace 5 lightbulbs with CFS", 
                    value: light
                }, {
                    name: "veg",
                    caption: " Switch to a vegetarian diet",
                    value: veg
                }
            ];
        });
    };

    $scope.sortActions = function() {
        $scope.descending = !$scope.descending;
    }

   


// -------------- SET UP CHARTS ----------------------
// ---------------------------------------------------


  $scope.drawPieChart = function(pieData) {
    var travel = (pieData["vehicle"] + pieData["public_transportation"] +pieData["air_travel"]);
    var housing = (pieData["home"] + pieData["electricity"] + pieData["natural_gas"] + pieData["heating"] + pieData["propane"]);
    var food = (pieData["meat"] + pieData["dairy"] + pieData["grains"] + pieData["fruit"] + pieData["other"]);


    var colors = ["#bf967a", "#b52d41", "#f06f5c"],

        categories = ['Travel', 'Housing', 'Food'],
        data = [{
            y: travel,
            color: colors[0],
            drilldown: {
                name: 'Travel',
                categories: ['Vehicle', 'Public<br> transportation', 'Air travel'],
                data: [pieData["vehicle"], pieData["public_transportation"], pieData["air_travel"]],
                color: colors[0]
            }
        }, {
            y: housing,
            color: colors[1],
            drilldown: {
                name: 'Housing',
                categories: ['Sqft', 'Electricity', 'Natural gas', 'Heating oil', 'Propane'],
                data: [pieData["home"], pieData["electricity"], pieData["natural_gas"], pieData["heating"], pieData["propane"]],
                color: colors[1]
            }
        }, {
            y: food,
            color: colors[2],
            drilldown: {
                name: 'Food',
                categories: ['Meat', 'Dairy', 'Grains', 'Fruit', 'Other'],
                data: [pieData["meat"], pieData["dairy"], pieData["grains"], pieData["fruit"], pieData["other"]],
                color: colors[2]
            }
        }],

        totalData = [], // ??
        subData = [], // ??
        i,
        j,
        dataLen = data.length,
        drillDataLen,
        brightness;


    // Build the data arrays
    for (i = 0; i < dataLen; i += 1) {

        // add browser data
        totalData.push({
            name: categories[i],
            y: data[i].y,
            color: data[i].color
        });

        // add version data
        drillDataLen = data[i].drilldown.data.length;
        for (j = 0; j < drillDataLen; j += 1) {
            brightness = 0.2 - (j / drillDataLen) / 5;
            subData.push({
                name: data[i].drilldown.categories[j],
                y: data[i].drilldown.data[j],
                color: Highcharts.Color(data[i].color).brighten(brightness).get()
            });
        }
    }

    // Create the chart
    $('#pieChartContainer').highcharts({
        credits: {
                enabled: false
        },
        chart: {
            type: 'pie',
            marginTop: 15,
            backgroundColor: 'transparent',
            borderColor: 'transparent'
        },
        title: {
            style: {
                fontSize: '26px'
            },
            text: 'Your carbon footprint'
        },
        subtitle: {
            text: 'Hover over a section for more info',
            style: {
                fontSize: '14px'
            }
        },
        yAxis: {
            title: {
                text: 'MT CO2/year'
            }
        },
        plotOptions: {
            pie: {
                center: ['50%', '50%'],
                borderColor: 'transparent',
                borderWidth: 0
            },
        },
        tooltip: {
            headerFormat: '{point.key}: ',
            pointFormat: '{point.y:.2f} MT CO2',
            style: {
                fontSize: '12pt',
                padding: 13
            } 
        },
        navigation: {
            buttonOptions: {
                enabled: false
            }
        },
        series: [{
            // name: 'Total',
            data: totalData,
            size: '40%',
            dataLabels: {
                formatter: function () {
                    return this.y > 3 ? this.point.name : null;
                },
                color: 'black',
                distance: -30,
                style: {
                    fontSize: '17px',
                    textShadow: false,
                }
            }
        }, {
            // name: 'Total',
            data: subData,
            size: '70%',
            innerSize: '60%',
            dataLabels: {
                formatter: function () {
                    // display only if larger than 1
                    return this.y > 0.5 ? '<b>' + this.point.name + ':</b> ' + this.y.toFixed(2) + ' MT' : null;
                },
                color: 'black',
                distance: 19,
                style: {
                    fontSize: '13px',
                    textShadow: false
                }
            }
        }]
    });
  };    

    $scope.drawBarChart = function(barData) {

        var profile_names = barData[0];
        profile_names[0] = "You"
        var travel_data = barData[1];
        var housing_data = barData[2];
        var food_data = barData[3];

        var colors = ["#bf967a", "#b52d41", "#f06f5c"];

        $('#barChartContainer').highcharts({
            credits: {
                enabled: false
            },
            chart: {
                type: 'column',
                backgroundColor:'transparent',
                height: 500
            },
            title: {
                text: 'User footprints'
            },
            xAxis: {
                lineWidth: 0.5,
                lineColor: '#ffffff',
                categories: profile_names,
                labels: {
                    style: {
                        fontSize: '16px'
                    }
                }
            },
            yAxis: {
                min: 0,
                gridLineColor: '#ffffff',
                gridLineWidth: .75,
                labels: {
                    style: {
                        fontSize: '14px'
                    }
                },
                title: {
                    margin: 20,
                    text: 'MT CO2 / year',
                    style: {
                        fontSize: '15px',
                    }
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        fontSize: '14px',
                        textShadow: false,
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: null,
                borderWidth: 1,
                shadow: false,
                itemStyle: {fontSize: '15px'}
            },
            tooltip: {
                // headerFormat: '{point.x}',
                pointFormat: '{series.name}: {point.y:.2f} MT CO2',
                // useHTML: true,
                style: {
                    fontSize: '12pt',
                    padding: 12
                },
               
            },
            plotOptions: {
                series: {
                    borderColor: null
                },
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        shadow: false,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                        style: {
                            textShadow: false,
                            fontSize: '14px'
                        },
                        formatter: function () {
                           return Highcharts.numberFormat(this.y,2);
                        }
                    }
                }
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            series: [{
                name: 'Travel',
                data: travel_data,
                color: colors[0]
            }, {
                name: 'Housing',
                data: housing_data,
                color: colors[1]
            }, {
                name: 'Food',
                data: food_data,
                color: colors[2]
            }]
        });
    };

// --------------- UPDATE CHARTS -------------------------------
// -------------------------------------------------------------


    $scope.updatePieChart = function() {
        $http.get('/api/v1/footprints/:id.json').then(function(response) {
        
        var pieData = response.data;
        
        var pieChart = $('#pieChartContainer').highcharts();
        var travel = (pieData["vehicle"] + pieData["public_transportation"] +pieData["air_travel"]);
        var housing = (pieData["home"] + pieData["electricity"] + pieData["natural_gas"] + pieData["heating"] + pieData["propane"]);
        var food = (pieData["meat"] + pieData["dairy"] + pieData["grains"] + pieData["fruit"] + pieData["other"]);

        var colors = ["#bf967a", "#b52d41", "#f06f5c"],
        categories = ['Travel', 'Housing', 'Food'],
        data = [{
            y: travel,
            color: colors[0],
            drilldown: {
                name: 'Travel',
                categories: ['Vehicle', 'Public transportation', 'Air travel'],
                data: [pieData["vehicle"], pieData["public_transportation"], pieData["air_travel"]],
                color: colors[0]
            }
        }, {
            y: housing,
            color: colors[1],
            drilldown: {
                name: 'Housing',
                categories: ['Sqft', 'Electricity', 'Natural gas', 'Heating oil', 'Propane'],
                data: [pieData["home"], pieData["electricity"], pieData["natural_gas"], pieData["heating"], pieData["propane"]],
                color: colors[1]
            }
        }, {
            y: food,
            color: colors[2],
            drilldown: {
                name: 'Food',
                categories: ['Meat', 'Dairy', 'Grains', 'Fruit', 'Other'],
                data: [pieData["meat"], pieData["dairy"], pieData["grains"], pieData["fruit"], pieData["other"]],
                color: colors[2]
            }
        }],

        totalData = [], // ??
        subData = [], // ??
        i,
        j,
        dataLen = data.length,
        drillDataLen,
        brightness;


        // Build the data arrays
        for (i = 0; i < dataLen; i += 1) {

            // add browser data
            totalData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                brightness = 0.2 - (j / drillDataLen) / 5;
                subData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }

        pieChart.series[0].setData(totalData, true);
        pieChart.series[1].setData(subData, true);
              
      });
    };




// ------------------- ONCLICK FUNCTIONS -------------------
// ---------------------------------------------------------

    $scope.decreaseChart = function() {
        $http.get('/api/v1/footprints/:id.json').then(function(response) {
            var pieData = response.data;
        $http.get('/api/v1/footprints.json').then(function(response) {
            var barData = response.data;
            $scope.changeCharts(pieData, barData);  
        });
      });
    };



    $scope.changeCharts = function(pieData, barData) {
    // set charts
        var pieChart = $('#pieChartContainer').highcharts();
        var barChart = $('#barChartContainer').highcharts();
    // get chart data
        var travel = (pieData["vehicle"] + pieData["public_transportation"] +pieData["air_travel"]);
        var housing = (pieData["home"] + pieData["electricity"] + pieData["natural_gas"] + pieData["heating"] + pieData["propane"]);
        var food = (pieData["meat"] + pieData["dairy"] + pieData["grains"] + pieData["fruit"] + pieData["other"]);
        var travelBar = barData[1];
        var housingBar = barData[2];
        var foodBar = barData[3];

        $scope.savedActions = [];
        $scope.totalSaved = 0;
    
        var gas = pieData["saved_gas"];
        var bike = pieData["bike"];
        var light = pieData["lightbulb"];
        var veg = pieData["veg"];

        var gasBox = document.getElementById("gas");
        var bikeBox = document.getElementById("bike");
        var lightBox = document.getElementById("lightbulb");
        var vegBox = document.getElementById("veg");

        
        console.log(pieData);
        if (gasBox.checked) {
            pieChart.series[1].data[0].update(pieData["vehicle"] - gas);
            pieChart.series[0].data[0].update(travel - gas);            
            barChart.series[0].data[0].update(travelBar[0] - gas);
                pieData["vehicle"] = pieData["vehicle"] - gas;
                travel = travel - gas;
                travelBar[0] = travelBar[0] - gas;
                $scope.savedActions.push(gas);
        } else if (!gasBox.checked) {
            pieChart.series[1].data[0].update(pieData["vehicle"]);
            pieChart.series[0].data[0].update(travel);
            barChart.series[0].data[0].update(travelBar[0]);  
        };
    

        if (bikeBox.checked) {
            pieChart.series[1].data[0].update(pieData["vehicle"] - bike);
            pieChart.series[0].data[0].update(travel - bike);
            barChart.series[0].data[0].update(travelBar[0] - bike);
                travel = travel - bike;
                travelBar[0] = travelBar[0] - bike;
                $scope.savedActions.push(bike);
        } else if (!gasBox.checked) {
            pieChart.series[1].data[0].update(pieData["vehicle"]);
            pieChart.series[0].data[0].update(travel);
            barChart.series[0].data[0].update(travelBar[0]); 
        };

        if (lightBox.checked) {
            pieChart.series[1].data[4].update(pieData["electricity"] - light);
            pieChart.series[0].data[1].update(housing - light);
            barChart.series[1].data[0].update(housingBar[0] - light);
                pieData["electricity"] = pieData["electricity"] - light;
                housing = housing - light;
                housingBar[0] = housingBar[0] - light;
                $scope.savedActions.push(light);
        } else if (!lightBox.checked){
            pieChart.series[1].data[4].update(pieData["electricity"]);
            pieChart.series[0].data[1].update(housing);
            barChart.series[1].data[0].update(housingBar[0]);
        };

        if (vegBox.checked) {
            pieChart.series[1].data[8].update(0);
            pieChart.series[0].data[2].update(food - veg);
            barChart.series[2].data[0].update(foodBar[0] - veg)
                pieData["meat"] = pieData["meat"] - veg;
                food = food - veg;
                foodBar[0] = foodBar[0] - veg;
                $scope.savedActions.push(veg);
        } else if (!vegBox.checked) {
            pieChart.series[1].data[8].update(pieData["meat"]);
            pieChart.series[0].data[2].update(food);
            barChart.series[2].data[0].update(foodBar[0]);
        };

        var total = 0;
        for (var i = 0; i < $scope.savedActions.length; i++) {
           total += $scope.savedActions[i]
        };

        $scope.totalSaved = parseFloat(total); 
    };




// ----------------- FORMS -------------------------------
// -------------------------------------------------------


            // SEND FORM 

    $scope.sendForm = function(formData, page, direction) {

        var urlString = "/api/v1/footprints/" + userId;

        $http.patch(urlString, formData).then(function(response){
            
            $scope.updatePieChart();
            $scope.errors = "";

            $scope.changePage(page, direction);

        }, function(response) { 
            $scope.errors = response.data.errors;
            // $scope.clicked = true; 

        });

    };


// -------------- CHANGE ICONS -------------------------


    $scope.changePill = function(page, newPage) {
        $scope.pills[page-1].visible = false;
        $scope.pills[newPage-1].visible = true;
    };



    $scope.changePage = function(page, direction) {
    
        if (direction === 1) {
            var newPage = page - 1;
        } else if (direction === 2) {
            var newPage = page + 1;
        };

        var pageStr = 'a[href="#' + (newPage) + '"]';
        $(pageStr).tab('show');
        
        // $scope.changePill(page, newPage);
    };


    $scope.vehicleOptions = [
      { name: "Gasoline", factor: 8.887 }, 
      { name: "Diesel", factor: 10.18}
    ];

    $scope.fuelType = $scope.vehicleOptions[0];

    $scope.publicOptions = [
      { name: "Bus", factor: 300 }, 
      { name: "Commuter rail",  factor: 165 }, 
      { name: "Transit Rail", factor: 160 }, 
      { name: "Amtrak", factor: 191 }
    ];

    $scope.publicType = $scope.publicOptions[0];

    $scope.submitTravel = function(mileage, carMiles, fuelType, miles, publicType, direction) {
      var formData = [
        {
          type: "vehicle",
          fuel_type: fuelType.factor,
          miles: carMiles,
          mileage: mileage
        }, {
          type: "public_transportation",
          miles: miles,
          mode: publicType.factor
        }];

      for (var i = 0; i < formData.length; i++) {
        $scope.sendForm(formData[i], 2, direction);
      };

    };

    $scope.submitAir = function(airMiles, direction) {
      var formData = {
        type: "air_travel",
        miles: airMiles
      };
      $scope.sendForm(formData, 3, direction);
    }

    $scope.electricityOptions = [
      { name: "kWh/year", factor: 1 },
      { name: "$/year", factor: 0.0834 }
    ];

    $scope.electricityType = $scope.electricityOptions[1];

    $scope.naturalOptions = [ 
      { name: "$/year", factor: 1.18 },
      { name: "Therms/year", factor: 1 }, 
      { name: "Cu.Ft/year", factor: 100 }
    ];

    $scope.naturalType = $scope.naturalOptions[0];

    $scope.submitEnergy = function(electricityInput, electricityType, naturalInput, naturalType, direction) {

      var formData = [
        {
          type: "electricity",
          input: electricityInput,
          input_type: electricityType.factor
        }, {
          type: "natural_gas",
          input: naturalInput,
          input_type: naturalType.factor
        }];

      for (var i = 0; i < formData.length; i++) {
        $scope.sendForm(formData[i], 4, direction);
      };

    };

    $scope.heatingOptions = [
      { name: "$/year", factor: 4.02 },
      { name: "gal/year", factor: 1 }
    ];

    $scope.heatingType = $scope.heatingOptions[0];

    // literally made up this value 3.12
    $scope.propaneOptions = [
      {name: "$/year", factor: 3.12 },
      { name: "gal/year", factor: 1 }
    ];

    $scope.propaneType = $scope.propaneOptions[0];

    $scope.submitHeat = function(heatingInput, heatingType, propaneInput, propaneType, direction ) {
      var formData = [
        {
          type: "heating",
          input: heatingInput,
          input_type: heatingType.factor
        }, {
          type: "propane",
          input: propaneInput,
          input_type: propaneType.factor
      }];

      for (var i = 0; i < formData.length; i++) {
        $scope.sendForm(formData[i], 5, direction);
      };

    };

    $scope.submitHome = function(homeSqft, direction) {
        var formData = { type: "home", sqft: homeSqft };

        $scope.sendForm(formData,6, direction);
    };


    $scope.meat = { value: 1 }
    $scope.dairy = { value: 1 }
    $scope.grains = { value: 1 }
    $scope.fruit = { value: 1 }
    $scope.other = { value: 1 }


    $scope.submitFood = function(meatValue, dairyValue, grainsValue, fruitValue, otherValue, direction) {
      
        var formData = [
            { type: "meat", factor: meatValue }, 
            { type: "dairy", factor: dairyValue },
            { type: "grains", factor: grainsValue }, 
            { type: "fruit", factor: fruitValue }, 
            { type: "other", factor: otherValue }
        ];
      
        for (var i = 0; i < formData.length; i++) {
            $scope.sendForm(formData[i], 7, direction);
        };

    };



  // ---------- sliders -------------------------------



  // MEAT

    d3.select("#nValueMeat").on("input", function () {
      updateMeat(+this.value);
    });

    updateMeat(1);

    function updateMeat(nValueMeat) {
      d3.select("#text-slider-meat").text(nValueMeat);
      d3.select("#nValueMeat").property("value", nValueMeat);
    }

    // DAIRY

    d3.select("#nValueDairy").on("input", function () {
      updateDairy(+this.value);
    });

    updateDairy(1);

    function updateDairy(nValueDairy) {
      d3.select("#text-slider-dairy").text(nValueDairy);
      d3.select("#nValueDairy").property("value", nValueDairy);
    }

    // GRAINS

    d3.select("#nValueGrains").on("input", function () {
      updateGrains(+this.value);
    });

    updateGrains(1);

    function updateGrains(nValueGrains) {
      d3.select("#text-slider-grains").text(nValueGrains);
      d3.select("#nValueGrains").property("value", nValueGrains);
    }

    // FRUIT

    d3.select("#nValueFruit").on("input", function () {
      updateFruit(+this.value);
    });

    updateFruit(1);

    function updateFruit(nValuefruit) {
      d3.select("#text-slider-fruit").text(nValuefruit);
      d3.select("#nValueFruit").property("value", nValuefruit);
    }


    // OTHER

    d3.select("#nValueOther").on("input", function () {
      updateOther(+this.value);
    });

    updateOther(1);

    function updateOther(nValueOther) {
      d3.select("#text-slider-Other").text(nValueOther);
      d3.select("#nValueOther").property("value", nValueOther);
    }




// ---------- SUBMIT INTRO!!!!!! ------------------------


    $scope.stateOptions = [
        { name: 'Alabama', abbreviation: 'AL'},
        { name: 'Alaska', abbreviation: 'AK'},
        { name: 'Arizona', abbreviation: 'AZ'},
        { name: 'Arkansas', abbreviation: 'AR'},
        { name: 'California', abbreviation: 'CA'},
        { name: 'Colorado', abbreviation: 'CO'},
        { name: 'Connecticut', abbreviation: 'CT'},
        { name: 'Delaware', abbreviation: 'DE'},
        { name: 'District of Columbia', abbreviation: 'DC'},
        { name: 'Florida', abbreviation: 'FL'},
        { name: 'Georgia', abbreviation: 'GA'},
        { name: 'Hawaii', abbreviation: 'HI'},
        { name: 'Idaho', abbreviation: 'ID'},
        { name: 'Illinois', abbreviation: 'IL'},
        { name: 'Indiana', abbreviation: 'IN'},
        { name: 'Iowa', abbreviation: 'IA'},
        { name: 'Kansas', abbreviation: 'KS'},
        { name: 'Kentucky', abbreviation: 'KY'},
        { name: 'Louisiana', abbreviation: 'LA'},
        { name: 'Maine', abbreviation: 'ME'},
        { name: 'Maryland', abbreviation: 'MD'},
        { name: 'Massachusettes', abbreviation: 'MA'},
        { name: 'Michican', abbreviation: 'MI'},
        { name: 'Minnesota', abbreviation: 'MN'},
        { name: 'Mississippi', abbreviation: 'MS'},
        { name: 'Missouri', abbreviation: 'MO'},
        { name: 'Montana', abbreviation: 'MT'},
        { name: 'Nebraska', abbreviation: 'NE'},
        { name: 'Nevada', abbreviation: 'NV'},
        { name: 'New Hampshire', abbreviation: 'NH'},
        { name: 'New Jersey', abbreviation: 'NJ'},
        { name: 'New Mexico', abbreviation: 'NM'},
        { name: 'New York', abbreviation: 'NY'},
        { name: 'North Carolina', abbreviation: 'NC'},
        { name: 'North Dakota', abbreviation: 'ND'},
        { name: 'Ohio', abbreviation: 'OH'},
        { name: 'Oklahoma', abbreviation: 'OK'},
        { name: 'Oregon', abbreviation: 'OR'},
        { name: 'Pennsylvania', abbreviation: 'PA'},
        { name: 'Rhode Island', abbreviation: 'RI'},
        { name: 'South Carolina', abbreviation: 'SC'},
        { name: 'South Dakota', abbreviation: 'SD'},
        { name: 'Tennessee', abbreviation: 'TN'},
        { name: 'Texas', abbreviation: 'TX'},
        { name: 'Utah', abbreviation: 'UT'},
        { name: 'Vermont', abbreviation: 'VT'},
        { name: 'Virginia', abbreviation: 'VA'},
        { name: 'Washington', abbreviation: 'WA'},
        { name: 'West Virginia', abbreviation: 'WV'},
        { name: 'Wisconsin', abbreviation: 'WI'},
        { name: 'Wyoming', abbreviation: 'WY' }
    ];

    $scope.stateInput = $scope.stateOptions[0];

    $scope.submitIntro = function(firstName, lastName, stateInput, direction) {
        var formData = {
            type: "intro",
            first_name: firstName,
            last_name: lastName,
            state: stateInput.abbreviation
        };

        $scope.sendForm(formData, 1, direction);
    };


    window.scope=$scope;

// ------------ MODAL -----------------------------------

    $scope.showCharts = function() {
        $scope.modalVisible = false;
        $scope.resultsVisible = true;
    };

    $scope.changeChart = function(chartType) {
        $scope.content = chartType;
    };

    $scope.checkChart = function(chartType) {
        return $scope.content === chartType;
    };


// -------------- PRINT CHART -------------------------


    
    $scope.drawPdfChart = function(pieData){
        
        var travel = (pieData["vehicle"] + pieData["public_transportation"] +pieData["air_travel"]);
        var housing = (pieData["home"] + pieData["electricity"] + pieData["natural_gas"] + pieData["heating"] + pieData["propane"]);
        var food = (pieData["meat"] + pieData["dairy"] + pieData["grains"] + pieData["fruit"] + pieData["other"]);


        var colors = ["#bf967a", "#b52d41", "#f06f5c"], // change colors?

        categories = ['Travel', 'Housing', 'Food'],
        data = [{
            y: travel,
            color: colors[0],
            drilldown: {
                name: 'Travel',
                categories: ['Vehicle', 'Public<br> transportation', 'Air travel'],
                data: [pieData["vehicle"], pieData["public_transportation"], pieData["air_travel"]],
                color: colors[0]
            }
        }, {
            y: housing,
            color: colors[1],
            drilldown: {
                name: 'Housing',
                categories: ['Sqft', 'Electricity', 'Natural gas', 'Heating oil', 'Propane'],
                data: [pieData["home"], pieData["electricity"], pieData["natural_gas"], pieData["heating"], pieData["propane"]],
                color: colors[1]
            }
        }, {
            y: food,
            color: colors[2],
            drilldown: {
                name: 'Food',
                categories: ['Meat', 'Dairy', 'Grains', 'Fruit', 'Other'],
                data: [pieData["meat"], pieData["dairy"], pieData["grains"], pieData["fruit"], pieData["other"]],
                color: colors[2]
            }
        }],

        totalData = [], // ??
        subData = [], // ??
        i,
        j,
        dataLen = data.length,
        drillDataLen,
        brightness;


        // Build the data arrays
        for (i = 0; i < dataLen; i += 1) {

            // add browser data
            totalData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                brightness = 0.2 - (j / drillDataLen) / 5;
                subData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }

        // Create the chart
        $('#pdfContainer').highcharts({
            credits: {
                    enabled: false
            },
            chart: {
                type: 'pie',
                margin: [20, 20, 20, 20],
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                spacing: [20,20,20,20],
                width: 500,
                height: 500
            },
            title: {
                style: {
                    fontSize: '26px'
                },
                text: 'My Carbon Footprint'
            },
            yAxis: {
                title: {
                    text: 'MT CO2/year'
                }
            },
            plotOptions: {
                pie: {
                    center: ['50%', '50%'],
                    borderColor: 'transparent',
                    borderWidth: 0,
                    showInLegend: true
                },
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },   
            legend: {
                align: 'left',
                verticalAlign: 'bottom',
                layout: 'vertical',
                labelFormatter: function () {
                    return this.name + ': ' + this.percentage.toFixed(1) + '%';
                }
            },

            series: [{
                // name: 'Total',
                data: totalData,
                size: '40%',
                dataLabels: {
                    formatter: function () {
                        return this.y > 3 ? this.point.name : null;
                    },
                    color: 'black',
                    distance: -30,
                    style: {
                        fontSize: '17px',
                        textShadow: false,
                    }
                }
            }, {
                // name: 'Total',
                data: subData,
                size: '70%',
                innerSize: '60%',
                dataLabels: {
                    formatter: function () {
                        // display only if larger than 1
                        return this.y > 0.5 ? '<b>' + this.point.name + ':</b> ' + this.y.toFixed(2) + ' MT' : null;
                    },
                    color: 'black',
                    distance: 19,
                    style: {
                        fontSize: '13px',
                        textShadow: false
                    }
                }
            }]
        });
    };

    $scope.printPdf = function(){
        var pieChart = $('#pdfContainer').highcharts();
        console.log(pieChart);
        pieChart.print();
    };



  });
}());