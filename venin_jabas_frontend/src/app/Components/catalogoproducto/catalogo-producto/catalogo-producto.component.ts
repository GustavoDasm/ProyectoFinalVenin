import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertComponent } from '../../objects/alert/alert/alert.component';
import { LoadingComponent } from '../../objects/loading/loading.component';
import { InfoComponent } from '../../objects/info/info/info.component';
import { CatalogoProducto } from 'src/app/Models/catalogoproducto/catalogo-producto';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-catalogo-producto',
  templateUrl: './catalogo-producto.component.html',

})
export class CatalogoProductoComponent implements OnInit {
  @ViewChild('btnshow', null) btnshow: ElementRef;
  @ViewChild('btnclose', null) btnclose: ElementRef;

  @ViewChild(AlertComponent, null) alert: AlertComponent;
  @ViewChild(LoadingComponent, null) loading: LoadingComponent;
  @ViewChild(InfoComponent, null) info: InfoComponent;
  public isShow: boolean = false;
  public pagina: number = 0;
  public total:number=0;
  public catalogos: CatalogoProducto[] = [];
  public catalogo:CatalogoProducto = new CatalogoProducto();
  public isEdit: boolean = false;
  public funcion: Function = null;
  public pagcatalog: any;
  public adddescripcion: boolean = false;
  public search = '';
  constructor(private data: DataService) { }

  ngOnInit() {
  }

  public show(affterfunction: Function = null) {
      this.funcion = affterfunction;
      this.isShow = true;
      this.showTab(1);
      setTimeout(() => {
          this.btnshow.nativeElement.click();
          this.GetData();
      }, 10);
  }

  GetData() {
      this.loading.show("cargando..");
      this.catalogos=[];
      let send;
      this.data.Exists(this.search)?
      send = this.data.GetFromValue(this.data.api.catalogoproducto, 'like', this.search):
      send = this.data.GetSimple(this.data.api.catalogoproducto)
        
     send.subscribe(r => {
        console.log(r);
        
          this.loading.hide();
          if (r.length>0) {
              this.catalogos = r;
              this.total= this.catalogos.length;
          }
      }, e => { this.loading.hide(); this.info.error(e, () => { this.showTab(1) }) })
  }
  showTab(i) {
      this.pagina = i;
  }

  seleccion(i){
    this.catalogo = i as CatalogoProducto;
    this.close();
  }

  close() {
      this.btnclose.nativeElement.click();
      setTimeout(() => {
          if (this.funcion != null) {
              this.funcion();
          }
      }, 10);
  }


}
