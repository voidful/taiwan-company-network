/*!
=========================================================
* Argon Dashboard React - v1.1.0
=========================================================
* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

const Chart = require("chart.js");

Chart.elements.Rectangle.prototype.draw = function() {
  const ctx = this._chart.ctx;
  const vm = this._view;
  const radiusObj = calculateRadius(vm);

  ctx.beginPath();
  ctx.fillStyle = vm.backgroundColor;
  ctx.strokeStyle = vm.borderColor;
  ctx.lineWidth = radiusObj.borderWidth;

  drawRoundedRectangle(ctx, radiusObj);

  ctx.fill();
  if (radiusObj.borderWidth) {
    ctx.stroke();
  }
};

function calculateRadius(vm) {
  let left, right, top, bottom, signX, signY, borderSkipped;
  const borderWidth = vm.borderWidth;
  const cornerRadius = 6;

  if (!vm.horizontal) {
    left = vm.x - vm.width / 2;
    right = vm.x + vm.width / 2;
    top = vm.y;
    bottom = vm.base;
    signX = 1;
    signY = bottom > top ? 1 : -1;
    borderSkipped = vm.borderSkipped || "bottom";
  } else {
    left = vm.base;
    right = vm.x;
    top = vm.y - vm.height / 2;
    bottom = vm.y + vm.height / 2;
    signX = right > left ? 1 : -1;
    signY = 1;
    borderSkipped = vm.borderSkipped || "left";
  }

  return {
    left,
    right,
    top,
    bottom,
    signX,
    signY,
    borderSkipped,
    borderWidth
  };
}

function drawRoundedRectangle(ctx, { left, right, top, bottom, borderWidth, borderSkipped, signX, signY }) {
  let radius = 6;

  if (borderWidth) {
    const barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
    borderWidth = borderWidth > barSize ? barSize : borderWidth;
    const halfStroke = borderWidth / 2;
    const borderLeft = left + (borderSkipped !== "left" ? halfStroke * signX : 0);
    const borderRight = right + (borderSkipped !== "right" ? -halfStroke * signX : 0);
    const borderTop = top + (borderSkipped !== "top" ? halfStroke * signY : 0);
    const borderBottom = bottom + (borderSkipped !== "bottom" ? -halfStroke * signY : 0);

    if (borderLeft !== borderRight) {
      top = borderTop;
      bottom = borderBottom;
    }
    if (borderTop !== borderBottom) {
      left = borderLeft;
      right = borderRight;
    }
  }

  const corners = [[left, bottom], [left, top], [right, top], [right, bottom]];
  const borders = ["bottom", "left", "top", "right"];
  const startCorner = borders.indexOf(borderSkipped, 0);

  function cornerAt(index) {
    return corners[(startCorner + index) % 4];
  }

  let corner = cornerAt(0);
  ctx.moveTo(corner[0], corner[1]);

  for (let i = 1; i < 4; i++) {
    corner = cornerAt(i);
    let nextCornerId = i + 1;
    if (nextCornerId === 4) {
      nextCornerId = 0;
    }
    const width = corners[2][0] - corners[1][0];
    const height = corners[0][1] - corners[1][1];
    const x = corners[1][0];
    const y = corners[1][1];

    if (radius > height / 2) {
      radius = height / 2;
    }
    if (radius > width / 2) {
      radius = width / 2;
    }

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
}

const mode = "light";
const fonts = { base: "Open Sans" };

const colors = {
  gray: {
    100: "#f6f9fc",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#8898aa",
    700: "#525f7f",
    800: "#32325d",
    900: "#212529"
  },
  theme: {
    default: "#172b4d",
    primary: "#5e72e4",
    secondary: "#f4f5f7",
    info: "#11cdef",
    success: "#2dce89",
    danger: "#f5365c",
    warning: "#fb6340"
  },
  black: "#12263F",
  white: "#FFFFFF",
  transparent: "transparent"
};

function chartOptions() {
  const options = {
    defaults: {
      global: {
        responsive: true,
        maintainAspectRatio: false,
        defaultColor: mode === "dark" ? colors.gray[700] : colors.gray[600],
        defaultFontColor: mode === "dark" ? colors.gray[700] : colors.gray[600],
        defaultFontFamily: fonts.base,
        defaultFontSize: 13,
        layout: { padding: 0 },
        legend: {
          display: false,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16
          }
        },
        elements: {
          point: {
            radius: 0,
            backgroundColor: colors.theme["primary"]
          },
          line: {
            tension: 0.4,
            borderWidth: 4,
            borderColor: colors.theme["primary"],
            backgroundColor: colors.transparent,
            borderCapStyle: "rounded"
          },
          rectangle: {
            backgroundColor: colors.theme["warning"]
          },
          arc: {
            backgroundColor: colors.theme["primary"],
            borderColor: mode === "dark" ? colors.gray[800] : colors.white,
            borderWidth: 4
          }
        },
        tooltips: {
          enabled: true,
          mode: "index",
          intersect: false
        }
      },
      doughnut: {
        cutoutPercentage: 83,
        legendCallback(chart) {
          const data = chart.data;
          return data.labels.map((label, index) => {
            const bgColor = data.datasets[0].backgroundColor[index];
            return `
              <span class="chart-legend-item">
                <i class="chart-legend-indicator" style="background-color: ${bgColor}"></i>
                ${label}
              </span>
            `;
          }).join('');
        }
      }
    }
  };

  Chart.scaleService.updateScaleDefaults("linear", {
    gridLines: {
      borderDash: [2],
      borderDashOffset: [2],
      color: mode === "dark" ? colors.gray[900] : colors.gray[300],
      drawBorder: false,
      drawTicks: false,
      lineWidth: 0,
      zeroLineWidth: 0,
      zeroLineColor: mode === "dark" ? colors.gray[900] : colors.gray[300],
      zeroLineBorderDash: [2],
      zeroLineBorderDashOffset: [2]
    },
    ticks: {
      beginAtZero: true,
      padding: 10,
      callback(value) {
        return !(value % 10) ? value : null;
      }
    }
  });

  Chart.scaleService.updateScaleDefaults("category", {
    gridLines: {
      drawBorder: false,
      drawOnChartArea: false,
      drawTicks: false
    },
    ticks: { padding: 20 }
  });

  return options;
}

function parseOptions(parent, options) {
  Object.keys(options).forEach(item => {
    if (typeof options[item] !== "object") {
      parent[item] = options[item];
    } else {
      parseOptions(parent[item], options[item]);
    }
  });
}

const chartExample1 = {
  options: {
    scales: {
      yAxes: [{
        gridLines: {
          color: colors.gray[900],
          zeroLineColor: colors.gray[900]
        },
        ticks: {
          callback(value) {
            return !(value % 10) ? `$${value}k` : null;
          }
        }
      }]
    },
    tooltips: {
      callbacks: {
        label(item, data) {
          const label = data.datasets[item.datasetIndex].label || "";
          const yLabel = item.yLabel;
          return `${label ? label + ' ' : ''}$${yLabel}k`;
        }
      }
    }
  },
  data1: canvas => ({
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{ label: "Performance", data: [0, 20, 10, 30, 15, 40, 20, 60, 60] }]
  }),
  data2: canvas => ({
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{ label: "Performance", data: [0, 20, 5, 25, 10, 30, 15, 40, 40] }]
  })
};

const chartExample2 = {
  options: {
    scales: {
      yAxes: [{
        ticks: {
          callback(value) {
            return !(value % 10) ? value : null;
          }
        }
      }]
    },
    tooltips: {
      callbacks: {
        label(item, data) {
          const label = data.datasets[item.datasetIndex].label || "";
          const yLabel = item.yLabel;
          return `${label ? label + ' ' : ''}${yLabel}`;
        }
      }
    }
  },
  data: {
    labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{ label: "Sales", data: [25, 20, 30, 22, 17, 29], maxBarThickness: 10 }]
  }
};

module.exports = {
  chartOptions, // used inside src/views/Index.js
  parseOptions, // used inside src/views/Index.js
  chartExample1, // used inside src/views/Index.js
  chartExample2 // used inside src/views/Index.js
};
