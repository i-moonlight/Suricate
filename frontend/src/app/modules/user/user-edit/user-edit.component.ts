/*
 * Copyright 2012-2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {ActivatedRoute} from '@angular/router';
import {User} from '../../../shared/model/dto/user/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';
import {ToastService} from '../../../shared/components/toast/toast.service';
import {ToastType} from '../../../shared/model/toastNotification/ToastType';

/**
 * Component user the edition of a user
 */
@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  /**
   * The form group
   */
  editUserForm: FormGroup;

  /**
   * The user to edit
   */
  user: User;

  /**
   * Constructor
   *
   * @param {UserService} userService The user service to inject
   * @param {ActivatedRoute} activatedRoute The activated route to inject
   * @param {FormBuilder} formBuilder The formBuilder service
   * @param {ToastService} toastService The service used for displayed Toast notification
   */
  constructor(private userService: UserService,
              private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private toastService: ToastService) { }

  /**
   * Called when the component is displayed
   */
  ngOnInit() {
    this
        .activatedRoute
        .params
        .subscribe( params => {
          this
              .userService
              .getById(params['userId'])
              .subscribe( user => {
                this.user = user;
                this.initUserEditForm();
              });
        });
  }

  /**
   * Init the user edit form
   */
  initUserEditForm() {
    this.editUserForm = this.formBuilder.group({
      username: [this.user.username, [Validators.required, Validators.minLength(3)]],
      firstname: [this.user.firstname, [Validators.required, Validators.minLength(2)]],
      lastname: [this.user.lastname, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, CustomValidators.email]]
    });
  }

  /**
   * Check if the field is invalid
   *
   * @param {string} field The field to check
   * @returns {boolean} False if the field valid, true otherwise
   */
  isFieldInvalid(field: string) {
    return this.editUserForm.invalid && (this.editUserForm.get(field).dirty || this.editUserForm.get(field).touched);
  }

  /**
   * Save a user
   */
  saveUser() {
    const userUpdated: User = this.editUserForm.value;
    userUpdated.id = this.user.id;

    this
        .userService
        .updateUser(userUpdated)
        .subscribe(() => this.toastService.sendMessage('User saved successfully', ToastType.SUCCESS));
  }

}
