// Your JavaScript code for creating the chart will go here
var ctx = document.getElementById("myChart").getContext("2d");
// eslint-disable-next-line no-undef
var myChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Ruby", "JavaScript", "HTML", "SQL", "CSS"],
    datasets: [
      {
        label: "# of Votes",
        data: [100, 100, 100, 100, 100],
        backgroundColor: [
          "rgba(152, 255, 152, 0.7)",
          "rgba(152, 251, 152, 0.7)",
          "rgba(0, 255, 127, 0.7)",
          "rgba(60, 179, 113, 0.7)",
          "rgba(127, 255, 212, 0.7)",
        ],
        borderColor: [
          "rgba(152, 255, 152, 1)",
          "rgba(152, 251, 152, 1)",
          "rgba(0, 255, 127, 1)",
          "rgba(60, 179, 113, 1)",
          "rgba(127, 255, 212, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    cutoutPercentage: 10,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

var ctx2 = document.getElementById("toolbox").getContext("2d");

var toolbox = new Chart(ctx2, {
  type: "pie",
  data: {
    labels: [
      "Bootstrap",
      "React",
      "Ruby on Rails",
      "Tailwind",
      "Minitest",
      "Postgres",
      "APIs",
      "Node/npm",
      "Git",
      "GitHub",
      "Postman",
      "Postico",
      "AWS Amplify",
    ],
    datasets: [
      {
        label: "# of Votes",
        data: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        backgroundColor: [
          "rgba(255, 20, 147, 0.6)",
          "rgba(255, 240, 245, 0.6)",
          "rgba(147, 112, 219, 0.6)",
          "rgba(255, 182, 193, 0.6)",
          "rgba(216, 191, 216, 0.6)",
          "rgba(255, 105, 180, 0.6)",
          "rgba(219, 112, 147, 0.6)",
          "rgba(221, 160, 221, 0.6)",
          "rgba(218, 112, 214, 0.6)",
          "rgba(240, 128, 128, 0.6)",
          "rgba(255, 0, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 20, 147, 1)",
          "rgba(255, 240, 245, 1)",
          "rgba(147, 112, 219, 1)",
          "rgba(255, 182, 193, 1)",
          "rgba(216, 191, 216, 1)",
          "rgba(255, 105, 180, 1)",
          "rgba(219, 112, 147, 1)",
          "rgba(221, 160, 221, 1)",
          "rgba(218, 112, 214, 1)",
          "rgba(240, 128, 128, 1)",
          "rgba(255, 0, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
