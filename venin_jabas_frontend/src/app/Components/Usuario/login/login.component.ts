import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Service/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/Service/data.service';
import { Usuario } from 'src/app/Models/usuario/usuario';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    public isError = false;
    public acceso = false;
    public usuario: Usuario = new Usuario();
    public alerta: string = '';
    constructor(public authservice: AuthService, private router: Router, private data: DataService) { }

    ngOnInit() {
        this.acceso = this.authservice.IsLogInOn;
        if(this.authservice.getCurrentUser() != null){
            this.router.navigateByUrl('/');
        }
    }

    LogIn() {
        this.data.Post(this.data.api.login, this.usuario).subscribe(r => {
            console.log(r);
            
            if (r.status!="success") {
                this.alerta = 'Usuario o contraseña incorrecta, por favor vuelva a ingresar las credenciales correctas';
                setTimeout(() => {
                    this.alerta = '';
                }, 5000);

            } else {
                
                console.log(r.message);
                this.authservice.setUser(r.data);
                this.data.setSucursalId(r.data.idsucursal)
                const idper = r.data.idpersonal || 1
                this.data.setPersonalId(idper)
                this.data.setPersonalNombre(r.data.personal_nombre || 'S/N');
                
                this.data.initSeriesPorSucursal();
                //window.location.reload();
                this.router.navigateByUrl('/').then(() => {
                    // Una vez que se navega correctamente a /ventas, recargamos
                    window.location.reload();
                });
            }
        }, e => { if (e.status==404) {
                this.alerta = 'Usuario o contraseña incorrecta, por favor vuelva a ingresar las credenciales correctas';
                setTimeout(() => {
                    this.alerta = '';
                }, 5000);
        } else {console.log(e.error.text);} });
    }


    onIsError(): void {
        this.isError = true;
        setTimeout(() => {
            this.isError = false;
        }, 4000);
    }
}
