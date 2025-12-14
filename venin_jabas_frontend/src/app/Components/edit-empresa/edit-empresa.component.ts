import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ALertOption } from 'src/app/Models/alert/alert-option';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { LoadingComponent } from '../objects/loading/loading.component';
import { Empresa } from 'src/app/Models/empresa/empresa';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-empresa',
  templateUrl: './edit-empresa.component.html',
  styleUrls: ['./edit-empresa.component.css']
})
export class EditEmpresaComponent implements OnInit {

  @ViewChild('e_loading', null) e_loading: LoadingComponent;
  @ViewChild('btnshowempresa', null) btnshowempresa: ElementRef;
  @ViewChild('btnclose', null) btnclose: ElementRef;
  @ViewChild('fileInput',null) fileInput: ElementRef;
  public funcion: Function;
  public isShow: boolean = false;
  public empresa: Empresa = new Empresa();
  isLogoString: boolean = false;
  alertoption: ALertOption = new ALertOption()
  selectedLogo: File | null = null;
  public isedit: boolean = false;
  logoPreviewUrl: string | null = null;
  ubigeos: any[]=[];
  constructor(private data: DataService,public http: HttpClient, private auth: AuthService,private renderer: Renderer2,private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  public show(affterfunction: Function = null) {

    this.funcion = affterfunction;
    this.isShow = true;
    setTimeout(() => {
      this.btnshowempresa.nativeElement.click();
      this.e_loading.show('Cargando datos');
      this.GetEmpresa()
      this.GetUbigeo()
      this.e_loading.hide();
      console.log("mostrando series");
    }, 10);
  }

  close() {
    if (this.isShow) { 
      this.btnclose.nativeElement.click(); 
      setTimeout(() => {
        this.isShow = false; 
        if (this.funcion != null) { 
          this.funcion(); // Ejecutamos el callback solo una vez
          this.funcion = null; // Limpiamos la función para evitar ejecuciones duplicadas
        }
      }, 250); 
    }
  }

  updateLogoType(): void {
    this.isLogoString = typeof this.empresa.logo === 'string';
  }

  GetEmpresa() {
    this.data.GetFromId(this.data.api.empresa, '1').subscribe(
      (res) => {
        //console.log(res);
        console.log(res);
        
        const { logo, logo2, logo3, ...empresaData } = res;
        this.empresa = empresaData;
        if (logo) {
          this.empresa.logo = logo
        }

        this.updateLogoType();
        console.log(this.empresa);
        

      },
      (error) => {
        console.log(error);
      }
    )
  }

  GetUbigeo() {
    this.data.GetSimple(this.data.api.ubigeos).subscribe(r => {
      this.ubigeos = r;
      this.ubigeos = this.ubigeos.map(item => ({
        ...item,
        nombreCompleto: `${item.descrip_ubigeo} - ${item.descrip_prov} - ${item.descrip_dep}`
      }));
    }, (e => { console.log(e) }));
  }

  onSelectFile() {
    // Usamos Renderer2 para hacer clic en el input de tipo archivo
    this.renderer.selectRootElement(this.fileInput.nativeElement).click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];  // Obtén el archivo
    if (file) {
      this.selectedLogo = file; 
      console.log(this.selectedLogo);
      const logoUrl = URL.createObjectURL(file);
      this.empresa.logo = this.sanitizer.bypassSecurityTrustUrl(logoUrl);
      console.log(this.empresa.logo);
      
    }
  }

  Guardarempresa() {
    // this.e_loading.show("Guardando");
    
    
    console.log("Mostardo imagen antes de guardar",this.selectedLogo);
    const formData = new FormData();
    
    // Agregar los campos de la empresa
    for (const key in this.empresa) {
      if (this.empresa.hasOwnProperty(key) && key !== 'logo') {
        formData.append(key, this.empresa[key]);
      }
    }

    // Agregar el archivo si está seleccionado
    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo, this.selectedLogo.name);  // 'logo' es el campo de backend
      console.log('Logo añadido al FormData:', this.selectedLogo);
    }
  
    // Verificar el contenido del FormData
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    this.http.put(`${this.data.api.apiUrl}empresa/1/`, formData).subscribe(
      (response:any) => {
        this.data.notify(response.message, 'Exito', this.data.alertType.success, this.alertoption, () => { this.close() })
      },
      error => {
        console.error('Error al guardar los datos', error);
        this.data.notify("Error al actualizar", 'Error', this.data.alertType.error, this.alertoption, () => { this.close() })
      }
    );
    
  }
}
