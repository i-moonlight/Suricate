/*
 * Copyright 2012-2021 the original author or authors.
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommunicationDialogComponent } from './communication-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommunicationDialogConfiguration } from '../../models/frontend/dialog/communication-dialog-configuration';
import { MockModule } from '../../../mock/mock.module';

describe('CommunicationDialogComponent', () => {
  let component: CommunicationDialogComponent;
  let fixture: ComponentFixture<CommunicationDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MockModule],
        declarations: [CommunicationDialogComponent],
        providers: [{ provide: MAT_DIALOG_DATA, useValue: buildCommunicationDialogConfiguration() }]
      }).compileComponents();

      fixture = TestBed.createComponent(CommunicationDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Build a mocked CommunicationDialogConfiguration for the unit tests
   */
  function buildCommunicationDialogConfiguration(): CommunicationDialogConfiguration {
    return {
      title: 'Title',
      message: 'Message',
      isErrorMessage: true
    };
  }
});
