
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { filter, switchMap, map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from "@angular/material";

export interface Device {id: string; name: string; owner: string; type: string; online: boolean; icon: string; status: string; state: any}
enum DeviceType {
  cerca = 'cerca',
  Garage = 'garage'
}

@Component({
  selector: 'app-devices',
  template: `
    <mat-list role="list">
      <mat-list-item role="listitem" *ngFor="let device of devices | async">
        <mat-icon matListIcon aria-label="Device type">{{ device.icon }}</mat-icon>
        <h3 matLine> {{ device.name }} </h3>
        <p matLine> {{ device.status }} </p>
        <button mat-icon-button (click)="deleteDevice(device)">
            <mat-icon>delete</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>
  `,
  styles: []
})
export class DevicesComponent implements OnInit {
  devices: Observable<Device[]>;
  constructor(private authService: AngularFireAuth, private afStore: AngularFirestore, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.devices = this.authService.authState.pipe(
      filter(user => user != null),
      switchMap(user => {
        // List the collection of devices for this user once signed in
        return this.afStore
          .collection('devices', ref => ref.where('owner', '==', user.uid))
          .snapshotChanges().pipe(
            map(actions => actions.map(a => {
              const data = a.payload.doc.data() as Device;
              data.icon = this.deviceIcon(data);
              data.status = this.deviceState(data);

              const id = a.payload.doc.id;
              return { id, ...data };
            }))
          );
      })
    )
  }

  /**
   * Determine the icon to display based on the device type
   */
  deviceIcon(device: Device) {
    switch (device.type) {
      case DeviceType.cerca: return 'lightbulb_outline';
      case DeviceType.Garage: return 'ac_unit';
      default: return 'developer_board';
    }
  }

  /**
   * Determine the state to display
   */
  deviceState(device: Device) {
    if (!device.online || !device.state) {
      return 'Offline';
    }

    switch (device.type) {
      case DeviceType.cerca:
        return device.state.on ? `Brightness: ${device.state.brightness}` : 'OFF';
      case DeviceType.Garage:
        return (device.state.mode !== 'off') ? `Mode: ${device.state.mode}, Setpoint: ${device.state.setpoint}` : 'OFF';
      default:
        return 'Unknown Device';
    }
  }

  /**
   * Remove this device from the user's account
   */
  deleteDevice(device: Device) {
    const batch = this.afStore.firestore.batch();
    // Delete the device configuration, followed by the device
    batch.delete(this.afStore.firestore.doc(`device-configs/${device.id}`));
    batch.delete(this.afStore.firestore.doc(`devices/${device.id}`));
    batch.commit().then(() => {
      this.snackBar.open(`Deleted ${device.name}`, '', {
        duration: 2000,
      });
    });
  }
}
