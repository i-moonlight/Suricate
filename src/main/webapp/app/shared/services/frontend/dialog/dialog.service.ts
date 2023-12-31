/*
 *  /*
 *  * Copyright 2012-2021 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationDialogConfiguration } from '../../../models/frontend/dialog/confirmation-dialog-configuration';
import { CommunicationDialogConfiguration } from '../../../models/frontend/dialog/communication-dialog-configuration';
import { ActionsDialogConfiguration } from '../../../models/frontend/dialog/actions-dialog-configuration';

/**
 * Service used to manage confirmation dialog
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  /**
   * Subject used to manage confirmation dialog message
   */
  private confirmationDialogSubject = new Subject<ConfirmationDialogConfiguration>();

  /**
   * Subject used to manage the communication dialog message
   */
  private communicationDialogSubject = new Subject<CommunicationDialogConfiguration>();

  /**
   * Subject used to manage the actions' dialog message
   */
  private actionsDialogSubject = new Subject<ActionsDialogConfiguration>();

  /**
   * Constructor
   */
  constructor() {}

  /**
   * Used to retrieve the messages
   */
  public listenConfirmationMessages(): Observable<ConfirmationDialogConfiguration> {
    return this.confirmationDialogSubject.asObservable();
  }

  /**
   * Used to send a new confirmation message
   *
   * @param confirmationConfiguration
   */
  public confirm(confirmationConfiguration: ConfirmationDialogConfiguration): void {
    this.confirmationDialogSubject.next(confirmationConfiguration);
  }

  /**
   * Used to retrieve the communication messages
   */
  public listenCommunicationMessages(): Observable<CommunicationDialogConfiguration> {
    return this.communicationDialogSubject.asObservable();
  }

  /**
   * Used to send a new communication message
   */
  public info(communicationDialogConfiguration: CommunicationDialogConfiguration): void {
    return this.communicationDialogSubject.next(communicationDialogConfiguration);
  }

  /**
   * Used to retrieve the actions messages
   */
  public listenActionsMessages(): Observable<ActionsDialogConfiguration> {
    return this.actionsDialogSubject.asObservable();
  }

  /**
   * Used to send a new actions' message
   *
   * @param actionsConfiguration
   */
  public actions(actionsConfiguration: ActionsDialogConfiguration): void {
    this.actionsDialogSubject.next(actionsConfiguration);
  }
}
