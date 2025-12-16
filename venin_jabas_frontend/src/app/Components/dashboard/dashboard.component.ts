import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/Service/data.service';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  chartVentasDiarias: any;  // Variable para el primer gráfico
  chartVentasMetodoPago: any;
  charTopVentasMes: any;
  chartStockProductos: any;
  public today = new Date();
  public selectedMonth: string = ''; // Mes seleccionado
  public productSelected: string = ''; // Producto seleccionado
  public articulos: any = [];
  public meses = [
    { nombre: 'Enero', valor: '01' },
    { nombre: 'Febrero', valor: '02' },
    { nombre: 'Marzo', valor: '03' },
    { nombre: 'Abril', valor: '04' },
    { nombre: 'Mayo', valor: '05' },
    { nombre: 'Junio', valor: '06' },
    { nombre: 'Julio', valor: '07' },
    { nombre: 'Agosto', valor: '08' },
    { nombre: 'Septiembre', valor: '09' },
    { nombre: 'Octubre', valor: '10' },
    { nombre: 'Noviembre', valor: '11' },
    { nombre: 'Diciembre', valor: '12' }
    // Agrega más meses según necesites
  ];

  // Datos recibidos (simulados como ejemplo)
  public DataSetByDay = [];
  public DataSetByPayMethod = [];
  public DaysList = [];
  public SalesByDay = [];
  constructor(private data: DataService,private titleService: Title,) {
    this.titleService.setTitle("Dashboard | Sistema Venin");
   }
  ngOnInit(): void {
    this.selectedMonth = (this.today.getMonth() + 1).toString()
    this.productSelected = '1'
    this.GetProductos();
    this.GetData();

  }

  GetProductos() {
    this.data.GetSimple('articulos').subscribe(
      (data) => {
        console.log("data obtenida", data);

        this.articulos = data

      },
      (error) => console.error(error => { })
    )
  }

  GetData() {
    this.GetVentasDiarias()
    // this.GetVentasPorMetodo()
    // this.GetTopVentasMes()
    // this.GetStockProductos()
  }

  GetVentasDiarias() {
    this.DataSetByDay = []

    const payload = {
      mes: this.selectedMonth,
      idproduct: this.productSelected,
      action: 'ventasdiarias',
      idsucursal: Number(this.data.getSucursalId())
    };
    this.data.Post('dashboard', payload).subscribe(
      (data) => {
        console.log("data obtenida", data);

        this.DataSetByDay = data

        const { labels, values } = this.processSalesDataForFullMonth(this.DataSetByDay, +this.selectedMonth, this.today.getFullYear());
        this.DaysList = labels
        this.SalesByDay = values
        this.GraficoVentasDiarias(labels, values);
      },
      (error) => console.error(error)
    )
  }

  GetVentasPorMetodo() {
    this.DataSetByDay = []
    this.data.GetFromValue('dashboard', 'ventasmetodos', this.selectedMonth).subscribe(
      (data) => {
        console.log("data obtenida", data);

        this.DataSetByPayMethod = data

        const { labels, values } = this.processSalesDataForPaymentMethod(this.DataSetByPayMethod);
        console.log("datos para ventas por metodo de pago", labels, values);

        this.GraficoVentasPorMetodo(labels, values);
      },
      (error) => console.error(error)
    )
  }

  GetTopVentasMes() {
    this.data.GetFromValue('dashboard', 'topventasmes', this.selectedMonth).subscribe(
      (data) => {
        console.log("data obtenida", data);


        this.GraficoTopVentasMes(data.labels, data.values);
      },
      (error) => console.error(error)
    )
  }

  GetStockProductos() {
    this.data.GetFromValue('dashboard', 'stockproductos', this.selectedMonth).subscribe(
      (data) => {
        console.log("data obtenida", data);


        this.GraficoStockProductos(data.labels, data.values);
      },
      (error) => console.error(error)
    )
  }


  processSalesDataForFullMonth(
    data: { idguiar__fecha: string; totaldia: number }[],
    month: number,
    year: number
  ) {

    // Crear un objeto con todos los días del mes inicializados en 0
    const daysInMonth = new Date(year, month, 0).getDate(); // Obtener número de días del mes
    const salesByDay: { [key: string]: number } = {};

    // Inicializar todos los días del mes en 0
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      salesByDay[formattedDay] = 0;
    }

    // Sumar las ventas de los datos recibidos
    data.forEach((item) => {
      if (salesByDay[item.idguiar__fecha] !== undefined) {
        salesByDay[item.idguiar__fecha] += item.totaldia;
      }
    });

    // Extraer las etiquetas y valores para el gráfico
    const labels = Object.keys(salesByDay);
    const values = Object.values(salesByDay);

    console.log("data emitida", salesByDay);

    return { labels, values };
  }


  processSalesDataForPaymentMethod(data: { metodo: string; totalfactu: number }[]): { labels: string[]; values: number[] } {

    const labels = data.map(item => item.metodo);  // Extrae los métodos de pago
    const values = data.map(item => item.totalfactu);

    return { labels, values };
  }

  // Crear gráfico de barras
  GraficoVentasDiarias(labels: string[], values: number[]): void {
    if (this.chartVentasDiarias) {
      this.chartVentasDiarias.destroy();
    }

    this.chartVentasDiarias = new Chart('ventasChart', {
      type: 'bar',
      data: {
        labels, // Fechas (Días del mes)
        datasets: [
          {
            label: 'Ventas Diarias ',
            data: values, // Ventas totales
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          display: false,  // Esto desactiva la leyenda
        },
        title: {
          display: true,
          text: 'Ventas Diarias', // Título personalizado para el gráfico
          fontSize: 18,
          fontColor: '#333'
        }
      }
    });
  }

  GraficoVentasPorMetodo(labels: string[], values: number[]): void {
    if (this.chartVentasMetodoPago) {
      this.chartVentasMetodoPago.destroy();
    }


    this.chartVentasMetodoPago = new Chart('ventasMetodoPagoChart', {
      type: 'bar',
      data: {
        labels, // Fechas (Días del mes)
        datasets: [
          {
            label: 'Ventas por metodo de pago (S/)',
            data: values, // Ventas totales
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          display: false,
          position: 'bottom'  // Esto desactiva la leyenda
        },
        title: {
          display: true,
          text: 'Ventas por metodo de pago (S/)', // Título personalizado para el gráfico
          fontSize: 18,
          fontColor: '#333'
        }
      }
    });
  }

  GraficoTopVentasMes(labels: string[], values: number[]): void {
    if (this.charTopVentasMes) {
      this.charTopVentasMes.destroy();
    }

    this.charTopVentasMes = new Chart('TopVentasChart', {
      type: 'bar',
      data: {
        labels, // Fechas (Días del mes)
        datasets: [
          {
            label: 'Ventas',
            data: values, // Ventas totales
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          display: false,  // Esto desactiva la leyenda
        },
        title: {
          display: true,
          text: [
            `10 Productos más vendidos de ${this.meses.find(mes => mes.valor === this.selectedMonth).nombre}`,
            'en unidades físicas'
          ], // Título personalizado para el gráfico
          fontSize: 18,
          fontColor: '#333'
        }
      }
    });
  }

  GraficoStockProductos(labels: string[], values: number[]): void {
    if (this.chartStockProductos) {
      this.chartStockProductos.destroy();
    }

    this.chartStockProductos = new Chart('StockProductos', {
      type: 'bar',
      data: {
        labels, // Fechas (Días del mes)
        datasets: [
          {
            label: 'Unidades',
            data: values, // Ventas totales
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          display: false,  // Esto desactiva la leyenda
        },
        title: {
          display: true,
          text: [
            `Stock de Productos`,
            'en unidades físicas'
          ], // Título personalizado para el gráfico
          fontSize: 18,
          fontColor: '#333'
        }
      }
    });
  }

}
