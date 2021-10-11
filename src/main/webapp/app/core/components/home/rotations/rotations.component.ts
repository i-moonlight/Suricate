import { Component, OnInit } from '@angular/core';
import { RotationFormFieldsService } from '../../../../shared/services/frontend/form-fields/rotation-form-fields/rotation-form-fields.service';
import { MaterialIconRecords } from '../../../../shared/records/material-icon.record';
import { IconEnum } from '../../../../shared/enums/icon.enum';
import { SidenavService } from '../../../../shared/services/frontend/sidenav/sidenav.service';
import { Project } from '../../../../shared/models/backend/project/project';
import { ValueChangedEvent } from '../../../../shared/models/frontend/form/value-changed-event';
import { EMPTY, Observable, of } from 'rxjs';
import { FormField } from '../../../../shared/models/frontend/form/form-field';
import { Rotation } from '../../../../shared/models/backend/rotation/rotation';
import { RotationProject } from '../../../../shared/models/backend/rotation-project/rotation-project';
import { HttpRotationService } from '../../../../shared/services/backend/http-rotation/http-rotation.service';
import { ToastTypeEnum } from '../../../../shared/enums/toast-type.enum';
import { ToastService } from '../../../../shared/services/frontend/toast/toast.service';
import { RotationRequest } from '../../../../shared/models/backend/rotation/rotation-request';
import { Router } from '@angular/router';
import { HeaderConfiguration } from '../../../../shared/models/frontend/header/header-configuration';
import { HttpProjectService } from '../../../../shared/services/backend/http-project/http-project.service';

@Component({
  selector: 'suricate-my-rotations',
  templateUrl: './rotations.component.html',
  styleUrls: ['./rotations.component.scss']
})
export class RotationsComponent implements OnInit {
  /**
   * The list of dashboards
   */
  public projects: Project[];

  /**
   * Configuration of the header
   */
  public headerConfiguration: HeaderConfiguration;

  /**
   * The list of material icons
   */
  public materialIconRecords = MaterialIconRecords;

  /**
   * Tell when the list of dashboards is loading
   */
  public isLoading: boolean;

  /**
   * The list of icons
   */
  public iconEnum = IconEnum;

  /**
   * The list of rotations of the current user
   */
  public rotations: Rotation[];

  /**
   * Constructor
   *
   * @param router The router service
   * @param sidenavService The sidenav service
   * @param rotationFormFieldsService The rotation form fields service
   * @param httpRotationService The rotation HTTP service
   * @param httpProjectService The project HTTP service
   * @param toastService The toast service
   */
  constructor(
    private readonly router: Router,
    private readonly sidenavService: SidenavService,
    private readonly rotationFormFieldsService: RotationFormFieldsService,
    private readonly httpRotationService: HttpRotationService,
    private readonly httpProjectService: HttpProjectService,
    private readonly toastService: ToastService
  ) {}

  /**
   * Init method
   */
  ngOnInit(): void {
    this.initHeaderConfiguration();

    this.httpRotationService.getAllForCurrentUser().subscribe((rotations: Rotation[]) => {
      this.isLoading = false;
      this.rotations = rotations;
    });
  }

  /**
   * Used to init the header component
   */
  private initHeaderConfiguration(): void {
    this.headerConfiguration = {
      title: 'rotation.list.my'
    };
  }

  /**
   * Display the side nav bar used to create a rotation
   */
  public openRotationCreationFormSidenav(): void {
    this.sidenavService.openFormSidenav({
      title: 'rotation.create',
      formFields: this.rotationFormFieldsService.generateRotationFormFields(),
      save: (rotationRequest: RotationRequest) => this.saveRotation(rotationRequest)
    });
  }

  /**
   * Save a new rotation
   *
   * @param rotationRequest The rotation request
   */
  private saveRotation(rotationRequest: RotationRequest): void {
    this.httpRotationService.create(rotationRequest).subscribe((createdRotation: Rotation) => {
      this.toastService.sendMessage('rotation.add.success', ToastTypeEnum.SUCCESS);
      this.router.navigate(['/rotations', createdRotation.token]);
    });
  }
}
