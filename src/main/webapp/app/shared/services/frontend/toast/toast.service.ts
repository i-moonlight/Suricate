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
import { BehaviorSubject, Observable } from 'rxjs';

import { ToastMessage } from '../../../models/frontend/toast/toast-message';
import { ToastTypeEnum } from '../../../enums/toast-type.enum';

/**
 * The service that manage toast notification message
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /**
   * The toast message subject
   * @type {BehaviorSubject<ToastMessage>}
   * @private
   */
  private toastMessageSubject = new BehaviorSubject<ToastMessage>(null);

  /**
   * The constructor
   */
  constructor() {}

  /**
   * get the toast message events
   * @returns {Observable<ToastMessage>}
   */
  public listenForToastMessages(): Observable<ToastMessage> {
    return this.toastMessageSubject.asObservable();
  }

  /**
   * A new message thru toast component
   * @param {string} title The title of the message
   * @param {ToastTypeEnum} style The message style
   * @param {string} content The content of the message
   */
  public sendMessage(title: string, style?: ToastTypeEnum, content?: string): void {
    this.toastMessageSubject.next(new ToastMessage(title, content, style));
  }
}
