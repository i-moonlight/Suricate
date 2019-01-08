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


import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {StompState} from '@stomp/ng2-stompjs';
import {Subscription} from 'rxjs';
import {auditTime, takeWhile} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';

import {Project} from '../../../../shared/model/api/project/Project';
import {ProjectWidget} from '../../../../shared/model/api/ProjectWidget/ProjectWidget';
import {DashboardService} from '../../dashboard.service';
import {WebsocketService} from '../../../../shared/services/websocket.service';
import {WSUpdateEvent} from '../../../../shared/model/websocket/WSUpdateEvent';
import {WSUpdateType} from '../../../../shared/model/websocket/enums/WSUpdateType';

import * as Stomp from '@stomp/stompjs';
import {HttpProjectService} from '../../../../shared/services/api/http-project.service';
import {HttpProjectWidgetService} from '../../../../shared/services/api/http-project-widget.service';

/**
 * Display the grid stack widgets
 */
@Component({
  selector: 'app-dashboard-screen',
  templateUrl: './dashboard-screen.component.html',
  styleUrls: ['./dashboard-screen.component.css']
})
export class DashboardScreenComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  /**
   * The project to display
   * @type {Project}
   */
  @Input() project: Project;
  /**
   * The project widget list
   * @type {ProjectWidget[]}
   */
  @Input() projectWidgets: ProjectWidget[];
  /**
   * Tell if the dashboard should be on readOnly or not
   * @type {boolean}
   */
  @Input() readOnly = true;
  /**
   * The screen code
   * @type {number}
   */
  @Input() screenCode: number;
  /**
   * The list of projectWidgets rendered by the ngFor
   * @type {QueryList<any>}
   */
  @ViewChildren('projectWidgetsRendered') projectWidgetsRendered: QueryList<any>;

  /**
   * Used for keep the subscription of subjects/Obsevables open
   * @type {boolean} True if we keep the connection, False if we have to unsubscribe
   * @private
   */
  private isAlive = true;

  /**
   * Save every web socket subscriptions event
   * @type {Subscription[]}
   * @private
   */
  private websocketSubscriptions: Subscription[] = [];

  /**
   * Hold the delete button subscriptions
   */
  private deleteButtonSubscriptions: any[] = [];

  /**
   * Hold the edit button subscriptions
   */
  private editButtonSubscriptions: any[] = [];

  /**
   * True if the grid items has been initialized false otherwise
   * @type {boolean}
   */
  _isGridItemInit = false;

  /**
   * The options for the plugin angular2-grid
   */
  gridOptions: {};

  /**
   * True if the "src" scripts Are Rendered
   * @type {boolean}
   */
  isSrcScriptsRendered = false;

  /**
   * The current stomp connection state
   * @type {StompState}
   */
  currentStompConnectionState: StompState;

  /**
   * The stomp state enum
   * @type {StompState}
   */
  stompStateEnum = StompState;

  /**
   * Tell if we should display the screen code
   * @type {boolean}
   */
  displayScreenCode = false;

  /**
   * constructor
   *
   * @param {DashboardService} dashboardService The dashboard service
   * @param {HttpProjectService} httpProjectService The http project service
   * @param {HttpProjectWidgetService} httpProjectWidgetService The http projerct widget service
   * @param {WebsocketService} websocketService The websocket service
   * @param {TranslateService} translateService The translation service to inject
   * @param {MatDialog} matDialog The material dialog service
   * @param {Router} router The router service
   * @param {ChangeDetectorRef} changeDetectorRef The change detector ref service
   */
  constructor(private dashboardService: DashboardService,
              private httpProjectService: HttpProjectService,
              private httpProjectWidgetService: HttpProjectWidgetService,
              private websocketService: WebsocketService,
              private translateService: TranslateService,
              private matDialog: MatDialog,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * Call before ngOnInit and at every changes
   * @param {SimpleChanges} changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.project) {
      this.project = changes.project.currentValue;

      this.httpProjectService.getProjectProjectWidgets(this.project.token).subscribe((projectWidgets: ProjectWidget[]) => {
        this.projectWidgets = projectWidgets;

        if (changes.project.previousValue && changes.project.previousValue.id !== changes.project.currentValue.id) {
          this.unsubscribeToDestinations();
          this.disconnect();
          this.websocketService.startConnection();
          this.subscribeToDestinations();
        }
      });
    }
  }

  /**
   * Init of the component
   */
  ngOnInit() {
    if (!this.screenCode) {
      this.screenCode = this.websocketService.getscreenCode();
    }

    if (this.project) {
      this.initGridStackOptions(this.project);
      this.websocketService.startConnection();
      this.subscribeToDestinations();

      this.websocketService
        .stompConnectionState$
        .pipe(
          takeWhile(() => this.isAlive),
          auditTime(10000)
        )
        .subscribe((stompState: StompState) => {
          this.currentStompConnectionState = stompState;
        });
    }
  }

  /**
   * Called when the view has been init
   */
  ngAfterViewInit() {
    if (!this.readOnly) {
      // Check when the projectWidgets *ngFor is ended
      this.projectWidgetsRendered.changes.subscribe((projectWidgetElements: QueryList<any>) => {
        this._isGridItemInit = true;
      });
    }

    // We have to inject this variable in the window scope (because some Widgets use it for init the js)
    window['page_loaded'] = true;
  }

  /**
   * Called when the component is getting destroy
   */
  ngOnDestroy() {
    this.unsubscribeToDestinations();
    this.disconnect();
    this.isAlive = false;
  }

  /* ******************************************************* */
  /*                  Grid Stack Management                  */

  /* ******************************************************* */

  /**
   * Init the options for Grid Stack plugin
   *
   * @param {Project} project The project used for the initialization
   */
  initGridStackOptions(project: Project) {
    this.gridOptions = {
      'max_cols': project.gridProperties.maxColumn,
      'min_cols': 1,
      'row_height': project.gridProperties.widgetHeight,
      'margins': [4],
      'auto_resize': true
    };

    if (this.readOnly) {
      this.gridOptions = {
        ...this.gridOptions,
        'draggable': false,
        'resizable': false,
      };
    }
  }


  /* *********  Common (Grid + Widget) CSS Management ******* */

  /**
   * Get the CSS for the grid
   *
   * @param {string} css The css
   * @returns {string} The css as html
   */
  getGridCSS(css: string): string {
    return `
      <style>
        .grid {
          ${css}
        }
      </style>
    `;
  }

  /**
   * Get the oommon css for each widget
   *
   * @returns {SafeHtml} AS safe HTML
   */
  getWidgetCommonCSS(): string {
    return `
      <style>
        .grid-stack .icon-background {
          pointer-events: none;
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100% !important;
          height: auto;
          font-size: 11rem;
          transform: translate(-50%, -50%);
          opacity: 0.05;
        }
        .grid-stack .widget {
          text-align: center;
        }
        .grid-stack .widget .fullwidget {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .grid-stack .grid-stack-item-content {
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          overflow: hidden;
        }
        .grid-stack .grid-stack-item-content * {
          color: #fff;
        }
        .grid-stack .grid-stack-item-content .link {
          display: block;
          width: 90%;
          margin: auto;
          position: relative;
          top: 5px;
          height: 91%;
        }
        .grid-stack .grid-stack-item-content-inner {
          max-height: 100%;
          position: relative;
          top: 50%;
          transform: translateY(-50%);
        }
        .grid-stack h1,.grid-stack h2,.grid-stack h3,.grid-stack h4,.grid-stack h5,.grid-stack p {
          padding: 0;
          margin: 0;
        }
        .grid-stack h1 {
          font-size: 1.4rem;
          text-transform: uppercase;
          margin-top: 6px;
          margin-bottom: 6%;
        }
        .grid-stack h2 {
          font-size: 3.7rem;
        }
        .grid-stack p {
          font-size: 0.8em;
        }
        .grid-stack .widget .more-info {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          position: absolute;
          bottom: 17px;
          left: 0;
          right: 0;
        }
        .grid-stack .widget .updated-at {
          color: rgba(0, 0, 0, 0.3);
          font-size: 0.9rem;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }

        ${this.getActionButtonsCss()}
      </style>
    `;
  }

  /* ************ JS Management *********************** */

  /**
   * Get the JS libraries from project
   *
   * @param {string[]} librariesToken The libraries token
   * @returns {string} The src script
   */
  getJSLibraries(librariesToken: string[]): string {
    let scriptUrls = '';

    librariesToken.forEach(token => {
      scriptUrls = scriptUrls.concat(`<script src="http://localhost:8080/api/asset/${token}"></script>`);
    });

    return scriptUrls;
  }


  /**
   * Set if src scripts are rendered
   * @param {boolean} isScriptRendered
   */
  setSrcScriptRendered(isScriptRendered: boolean) {
    this.isSrcScriptsRendered = isScriptRendered;
  }

  /* *************** Widget Action buttons (CSS, HTML, Bindings) ************** */
  /**
   * Get the css for widget action buttons
   *
   * @returns {string}
   */
  getActionButtonsCss(): string {
    return `
      .widget .btn-widget {
        position: absolute;
        background-color: rgba(66,66,66,0.6);
        color: #cfd2da !important;
        border: none;
        cursor: pointer;
        z-index: 20;
      }
      .widget .btn-widget .material-icons {
        font-size: 16px;
        color: #cfd2da !important;
      }
      .widget .btn-widget.btn-widget-delete {
        right: 0;
      }
      .widget .btn-widget.btn-widget-edit {
        right: 34px;
      }
    `;
  }

  /* ******************************************************* */
  /*                  Websocket Management                   */

  /* ******************************************************* */

  /**
   * Subscribe to destinations
   */
  subscribeToDestinations() {
    this.websocketSubscriptions.push(
      this.websocketService
        .subscribeToDestination(`/user/${this.project.token}-${this.screenCode}/queue/unique`)
        .pipe(takeWhile(() => this.isAlive))
        .subscribe((stompMessage: Stomp.Message) => this.handleUniqueScreenEvent(JSON.parse(stompMessage.body)))
    );

    this.websocketSubscriptions.push(
      this.websocketService
        .subscribeToDestination(`/user/${this.project.token}/queue/live`)
        .pipe(takeWhile(() => this.isAlive))
        .subscribe((stompMessage: Stomp.Message) => this.handleGlobalScreenEvent(JSON.parse(stompMessage.body)))
    );
  }

  /**
   * Manage the event sent by the server (destination : A specified screen)
   *
   * @param {WSUpdateEvent} updateEvent The message received
   */
  handleUniqueScreenEvent(updateEvent: WSUpdateEvent) {
    if (updateEvent.type === WSUpdateType.DISCONNECT) {
      this.unsubscribeToDestinations();
      this.websocketService.disconnect();
      this.router.navigate(['/tv']);
    }
  }

  /**
   * Manage the event sent by the server (destination : Every screen connected to this project)
   *
   * @param {WSUpdateEvent} updateEvent The message received
   */
  handleGlobalScreenEvent(updateEvent: WSUpdateEvent) {
    // WIDGET
    if (updateEvent.type === WSUpdateType.WIDGET) {
      const projectWidget: ProjectWidget = updateEvent.content;
    }

    // POSITION & GRID
    if (updateEvent.type === WSUpdateType.POSITION || updateEvent.type === WSUpdateType.GRID) {
      const projectUpdated: Project = updateEvent.content;
      if (projectUpdated) {
        this._isGridItemInit = false;
      }
    }

    // RELOAD
    if (updateEvent.type === WSUpdateType.RELOAD) {
      location.reload();
    }

    // DISPLAY SCREEN CODE
    if (updateEvent.type === WSUpdateType.DISPLAY_NUMBER) {
      this.displayScreenCode = true;
      setTimeout(() => this.displayScreenCode = false, 10000);
    }

    this.changeDetectorRef.detectChanges();
  }

  unsubscribeToDestinations() {
    this.websocketSubscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  disconnect() {
    this.websocketService.disconnect();
  }

  /**
   * Sort project widgets should avoid some troubles
   *
   * @param {ProjectWidget[]} projectWidgets The list to sort
   * @returns {ProjectWidget[]} TThe list sorted by row and col
   */
  sortProjectWidgets(projectWidgets: ProjectWidget[]) {
    projectWidgets.sort((left, right): number => {
      if (left.widgetPosition.row < right.widgetPosition.row) {
        return -1;
      }
      if (left.widgetPosition.row > right.widgetPosition.row) {
        return 1;
      }
      if (left.widgetPosition.row == right.widgetPosition.row) {
        if (left.widgetPosition.col < right.widgetPosition.col) {
          return -1;
        }
        if (left.widgetPosition.col > right.widgetPosition.col) {
          return 1;
        }
        return 0;
      }
    });

    return projectWidgets;
  }
}
