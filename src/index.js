const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

let GlobalData = "";
let formmatedArr = [];
let categoryArr = [];

//function to transform text file data into JSON format
const formatData = () => {
  fs.readFile(path.join(__dirname, "salesData.txt"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let formattedString = data.replace(/\r\n/g, ",");
    GlobalData = formattedString;
  });
  let data = GlobalData.split(",");
  for (let i = 5; i <= data.length; i += 5) {
    let obj = {
      date: new Date(data[i]),
      month: new Date(data[i]).getMonth(),
      sku: data[i + 1],
      unit_price: data[i + 2],
      quntity: data[i + 3],
      total_price: parseInt(data[i + 4]),
    };
    formmatedArr.push(obj);
  }
  formmatedArr.pop();
  formmatedArr.filter((item) => {
    if (!categoryArr.includes(item.sku)) {
      categoryArr.push(item.sku);
    }
  });
};

//return formatted Data
app.get("/", async (req, res) => {
  formatData();
  res.send(formmatedArr);
});

//return total_sales of store
app.get("/total-sales", (req, res) => {
  let totalSales = [];
  let totalVal = 0;
  let priceArr = formmatedArr.filter((item) => {
    totalSales.push(item.total_price);
  });
  totalSales.pop();
  console.log(totalSales.includes(null));
  totalSales.map((item) => {
    if (item != NaN) {
      totalVal += item;
    }
  });
  res.send({ totalVal });
  // return totalSales;
});

//return month vise total sale
//months param value: 0,1,2,3,...
app.get("/months-sales/:month", (req, res) => {
  let month = req.params.month;
  let monthsDataArr = [];
  let monthValArr = [];
  formmatedArr.map((item) => {
    if (item.month == month) {
      monthsDataArr.push(item);
    }
  });

  monthsDataArr.filter((item) => {
    monthValArr.push(item.total_price);
  });

  const sum = monthValArr.reduce((accumulator, a) => {
    return accumulator + a;
  }, 0);
  res.send({ sum });
});

//return most poplar product, it's monthly revenu and min, max and avarage order of that product
app.get("/month-popular/:month", (req, res) => {
  let popularItemVal = 0;
  let popularItem;
  let quantityArr = [];
  let highestRevenu = 0;
  let highestRevenuItem;
  let month = req.params.month;
  let monthData = formmatedArr.filter((item) => item.month == month);
  categoryArr.map((category) => {
    let sumofCat = 0;
    let sumofRevenu = 0;
    let dataArr = monthData.filter((item) => item.sku === category);
    // console.log(dataArr);
    //most popular Item
    dataArr.map((item) => {
      sumofCat = sumofCat + parseInt(item.quntity);
    });
    if (popularItemVal < sumofCat) {
      popularItem = category;
      popularItemVal = sumofCat;
    }

    //most revenu genrated item
    // console.log(dataArr);
    dataArr.map((item) => {
      sumofRevenu = sumofRevenu + parseInt(item.total_price);
    });
    // console.log("EoF");
    if (highestRevenu < sumofRevenu) {
      highestRevenu = sumofRevenu;
      highestRevenuItem = category;
    }

    //min avarage and max quantity of favourite items
    dataArr.map((item) => {
      if (item.sku === popularItem) {
        quantityArr.push(item.quntity);
      }
    });
  });

  quantityArr.sort();

  res.send({
    ItemQuantity: popularItemVal,
    popularItem,
    highestRevenu,
    highestRevenuItem,
    QuantityChart: {
      min: quantityArr[0],
      max: quantityArr[quantityArr.length - 1],
      avarage: Math.floor(quantityArr[Math.floor(quantityArr.length / 2)]),
    },
  });
});

app.listen(5000, () => {
  console.log("App running on Port 5000");
});
