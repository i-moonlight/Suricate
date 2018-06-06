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

import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DashboardService} from '../dashboard.service';
import {takeWhile} from 'rxjs/operators';
import {Project} from '../../../shared/model/dto/Project';
import {AddWidgetDialogComponent} from '../../../shared/components/pages-header/components/add-widget-dialog/add-widget-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

/**
 * Component that display a specific dashboard
 */
@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.css']
})
export class DashboardDetailComponent implements OnInit, OnDestroy {

  /**
   * The widget dialog ref
   */
  addWidgetDialogRef: MatDialogRef<AddWidgetDialogComponent>;

  /**
   * Tell if the component is displayed
   *
   * @type {boolean}
   */
  isAlive = true;

  /**
   * The project as observable
   */
  project$: Observable<Project>;

  /**
   * constructor
   *
   * @param {ActivatedRoute} activatedRoute The activated route service
   * @param {DashboardService} dashboardService The dashboard service
   * @param {MatDialog} matDialog The mat dialog service
   */
  constructor(private activatedRoute: ActivatedRoute,
              private dashboardService: DashboardService,
              private matDialog: MatDialog) { }

  /**
   * Init objects
   */
  ngOnInit() {
    // Global init from project
    this.activatedRoute.params.subscribe( params => {
      this.dashboardService
          .getOneById(+params['id'])
          .subscribe(project => {
            this.dashboardService.currendDashbordSubject.next(project);
          });
    });

    this.dashboardService
        .currendDashbordSubject
        .pipe(takeWhile(() => this.isAlive))
        .subscribe(project => this.project$ = of(project) );
  }

  /**
   * The add widget dialog ref
   */
  openAddWidgetDialog() {
    this.addWidgetDialogRef = this.matDialog.open(AddWidgetDialogComponent, {
      minWidth: 900,
      minHeight: 500,
    });
  }

  /**
   * When the component is destroyed
   */
  ngOnDestroy() {
    this.isAlive = false;
  }

}
