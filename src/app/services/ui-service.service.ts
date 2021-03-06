import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UiServiceService {
  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async alertaInformativa(message: string) {
    const alert = await this.alertController.create({
      message,
      buttons: ['OK'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      position: 'top',
      duration: 1500,
    });
    toast.present();
  }
}
