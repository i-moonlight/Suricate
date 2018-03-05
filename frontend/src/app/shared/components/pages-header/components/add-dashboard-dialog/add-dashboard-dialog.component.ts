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

import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatHorizontalStepper} from '@angular/material';
import {CustomValidators} from 'ng2-validation';
import {DashboardService} from '../../../../../modules/dashboard/dashboard.service';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {User} from '../../../../model/dto/user/User';
import {UserService} from '../../../../../modules/user/user.service';
import {Observable} from 'rxjs/Observable';
import {empty} from 'rxjs/observable/empty';
import {Project} from '../../../../model/dto/Project';

@Component({
  selector: 'app-add-dashboard-dialog',
  templateUrl: './add-dashboard-dialog.component.html',
  styleUrls: ['./add-dashboard-dialog.component.css']
})
export class AddDashboardDialogComponent implements OnInit {
  @ViewChild('addDashboardStepper') addDashboardStepper: MatHorizontalStepper;

  dashboardForm:      FormGroup;
  dashboardFormCompleted: boolean;

  addUserForm:        FormGroup;
  userAutoComplete:   Observable<User[]>;
  projectAdded:       Project;

  constructor(private formBuilder: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef,
              private dashboardService: DashboardService,
              private userService: UserService) { }

  ngOnInit() {
    // init form dashboard
    this.dashboardFormCompleted = false;
    this.dashboardForm = this.formBuilder.group({
      'name': ['t', [Validators.required]],
      'widgetHeight': ['360', [Validators.required, CustomValidators.digits, CustomValidators.gt(0)]],
      'maxColumn': ['5', [Validators.required, CustomValidators.digits, CustomValidators.gt(0)]]
    });

    // Init Add user form
    this.addUserForm = this.formBuilder.group({
      'username': ['', [Validators.required]]
    });
    // Populate user autocomplete
    this.userAutoComplete = this.addUserForm.get('username').valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap( username => username ? this.userService.searchUserByUsername(username) : empty<User[]>())
    );
  }

  /**
   * Check if the field is valid
   *
   * @param {string} field
   * @returns {boolean}
   */
  isFieldInvalid(field: string) {
    return this.dashboardForm.invalid && (this.dashboardForm.get(field).dirty || this.dashboardForm.get(field).touched);
  }

  addDashboard() {
    if (this.dashboardForm.valid) {
      this.projectAdded = { ...this.projectAdded,
                            ...this.dashboardForm.value};

      this.dashboardService
          .addProject(this.projectAdded)
          .subscribe(project => {
            this.projectAdded = project;
            this.dashboardFormCompleted = true;
            this.changeDetectorRef.detectChanges();
            this.addDashboardStepper.next();
          });
    }
  }

  addUser() {
    if (this.addUserForm.valid) {
      this.dashboardService
          .addUserToProject(this.projectAdded, this.addUserForm.value)
          .subscribe(project => this.projectAdded = project);
    }
  }

  deleteUser(userId: number) {
    this.dashboardService
        .deleteUserFromProject(this.projectAdded, userId)
        .subscribe(project => this.projectAdded = project);
  }
}
