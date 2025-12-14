import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { isNullOrUndefined } from "util";
import { Router } from '@angular/router';
import { Settings } from '../Settings/settings';
import { Usuario } from "../Models/usuario/usuario";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public IsLogInOn= false;
  private api = Settings.urlAPi;
  public usuario:Usuario=new Usuario();
  constructor(private http:HttpClient, private router:Router) { }
  httpOption = {headers:new HttpHeaders({'Content-Type':'application/json'})}
 

  loginuser(usuario: string, clave: string): Observable<any> {
    let json = {'usuario':usuario,'clave':clave}
    return this.http.post<any>(Settings.urlAPi + 'usuario/select/lgin',json,this.httpOption);
  }

  setUser(user:any): void {
    this.usuario = user;
    let user_string = JSON.stringify(this.usuario);
    sessionStorage.setItem("currentUser", user_string);

  }

  setToken(token): void {
    sessionStorage.setItem("accessToken", token);
  }

  getToken() {
    return sessionStorage.getItem("accessToken");
  }

  getCurrentUser(): any {
    let user_string = sessionStorage.getItem("currentUser");

    if (!isNullOrUndefined(user_string)) {
      let user = JSON.parse(user_string);
      
      return user;
    } else {
      return null;
    }
  }

  logoutUser() {
    let accessToken = sessionStorage.getItem("accessToken");
    //const url_api = `http://localhost:3000/api/Users/logout?access_token=${accessToken}`;
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("currentUser");
    //return this.http.post<any>(url_api, this.httpOption);
    this.router.navigateByUrl("/usuario/login");
  }
}
