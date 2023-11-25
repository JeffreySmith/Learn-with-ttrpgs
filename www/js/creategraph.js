function createChart(id) {
  fetch(`/sessioninfo/${id}/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let xVals = [];
      let yVals = [];

      for (let d of data) {
        xVals.push(d.time);
	yVals.push(Math.min(d.level, 15));

      }
      if(xVals.length===0 && yVals.length===0){
	document.getElementById("graphSection").style="display:none;";
      }
      new Chart("chart", {
        type: "line",
        data: {
          labels: xVals,
          datasets: [
            {
              fill: false,
              lineTension: 0,
              backgroundColor: "rgba(255,255,255,1.0)",
              borderColor: "rgba(255,255,255,.5)",
              data: yVals,
            },
          ],
        },
        options: {
          legend: { display: false },
          scales: {
            yAxes: [{ ticks: { min: 0, max: 20 } }],
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
