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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogConfiguration } from '../../models/frontend/dialog/confirmation-dialog-configuration';
import { ButtonConfiguration } from '../../models/frontend/button/button-configuration';
import { IconEnum } from '../../enums/icon.enum';

/**
 * Confirmation dialog
 */
@Component({
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  /**
   * The configuration of the confirmation dialog
   */
  public configuration: ConfirmationDialogConfiguration;

  /**
   * The configuration of the yes/no buttons
   */
  public yesNoButtonsConfiguration: ButtonConfiguration<unknown>[];

  /**
   * Constructor
   *
   * @param confirmationDialogRef Reference on the instance of this dialog
   * @param data The data given to the dialog
   */
  constructor(
    private readonly confirmationDialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: ConfirmationDialogConfiguration
  ) {
    this.configuration = data;
    this.initYesNoButtonsConfiguration();
  }

  /**
   * Init the buttons configurations
   */
  private initYesNoButtonsConfiguration(): void {
    this.yesNoButtonsConfiguration = [
      {
        label: 'no',
        icon: IconEnum.CLOSE,
        color: 'primary'
      },
      {
        label: 'yes',
        icon: IconEnum.SAVE,
        color: 'warn',
        callback: () => this.configuration.accept()
      }
    ];
  }
}
