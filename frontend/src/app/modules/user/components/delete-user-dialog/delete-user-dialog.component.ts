import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {User} from '../../../../shared/model/dto/user/User';

/**
 * Dialog used for displaying "Yes / No" popup
 */
@Component({
  selector: 'app-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html',
  styleUrls: ['./delete-user-dialog.component.css']
})
export class DeleteUserDialogComponent implements OnInit {

  /**
   * The user we want to delete
   */
  user: User;

  /**
   * The constructor
   *
   * @param data The data passed to the Dialog
   */
  constructor(@Inject(MAT_DIALOG_DATA) private data: any) { }

  /**
   * Called when the component is init
   */
  ngOnInit() {
    this.user = this.data.user;
  }
}
