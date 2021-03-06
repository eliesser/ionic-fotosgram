import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { environment } from '../../environments/environment';
import { Usuario } from '../interfaces/interfaces';
import { NavController } from '@ionic/angular';

const URL = environment.url;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  token: string = null;
  private usuario: Usuario = {};

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private navController: NavController
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  login(email: string, password: string) {
    const data = { email, password };

    return new Promise((resolve) => {
      this.http.post(`${URL}/user/login`, data).subscribe(async (resp) => {
        if (resp['ok']) {
          await this.guardarToken(resp['token']);
          resolve(true);
        } else {
          this.token = null;
          this.storage.clear();
          resolve(false);
        }
      });
    });
  }

  registro(usuario: Usuario) {
    return new Promise((resolve) => {
      this.http.post(`${URL}/user/create`, usuario).subscribe(async (resp) => {
        console.log(resp['ok']);
        if (resp['ok']) {
          await this.guardarToken(resp['token']);
          resolve(true);
        } else {
          this.token = null;
          this.storage.clear();
          resolve(false);
        }
      });
    });
  }

  getUsuario() {
    if (!this.usuario && !this.usuario._id) {
      this.validaToken();
    }

    return { ...this.usuario };
  }

  async guardarToken(token: string) {
    this.token = token;
    await this.storage.set('token', token);
    await this.validaToken();
  }

  async cargarToken() {
    this.token = (await this.storage.get('token')) || null;
  }

  async validaToken(): Promise<boolean> {
    await this.cargarToken();

    if (!this.token) {
      this.navController.navigateRoot('/login');
      return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
      const headers = new HttpHeaders({
        'x-token': this.token,
      });

      this.http.get(`${URL}/user/`, { headers }).subscribe((resp) => {
        if (resp['ok']) {
          this.usuario = resp['usuario'];
          resolve(true);
        } else {
          this.navController.navigateRoot('/login');
          resolve(false);
        }
      });
    });
  }

  actualizarUsuario(usuario: Usuario) {
    const headers = new HttpHeaders({
      'x-token': this.token,
    });

    return new Promise<boolean>((resolve) => {
      this.http
        .put(`${URL}/user/update`, usuario, { headers })
        .subscribe((resp) => {
          if (resp['ok']) {
            this.guardarToken(resp['token']);
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }

  logout() {
    this.token = null;
    this.usuario = null;
    this.storage.clear();
    this.navController.navigateRoot('login', { animated: true });
  }
}
