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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../../shared/model/dto/user/User';

import {Observable} from 'rxjs/Observable';
import {AbstractHttpService} from '../../shared/services/abstract-http.service';
import {map} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TokenService} from '../../shared/auth/token.service';
import {RoleEnum} from '../../shared/model/dto/enums/RoleEnum';
import {UserSetting} from '../../shared/model/dto/UserSetting';
import {SettingsService} from '../../shared/services/settings.service';

/**
 * User service that manage users
 */
@Injectable()
export class UserService extends AbstractHttpService {

  /**
   * The base url for user API
   * @type {string} The user API url
   */
  private static readonly _USERS_BASE_URL = `${AbstractHttpService.BASE_API_URL}/${AbstractHttpService.USERS_URL}`;

  /**
   * The connected user subject
   * @type {Subject<User>}
   */
  private _connectedUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  /**
   * The constructor
   *
   * @param {HttpClient} _httpClient The http client service to inject
   * @param {TokenService} _tokenService The token service
   * @param {SettingsService} _themeService The theme service
   */
  constructor(private _httpClient: HttpClient,
              private _tokenService: TokenService,
              private _themeService: SettingsService) {
    super();
  }

  /* *************************************************************************************** */
  /*                            Subject Management                                           */

  /* *************************************************************************************** */

  /**
   * Get the connected user event
   * @returns {Observable<User>}
   */
  get connectedUser$(): Observable<User> {
    return this._connectedUserSubject.asObservable();
  }

  /**
   * Get the current connected user value
   * @returns {User}
   */
  get connectedUser(): User {
    return this._connectedUserSubject.getValue();
  }

  /**
   * Set and send the new connected user
   * @param {User} connectedUser
   */
  set connectedUser(connectedUser: User) {
    this._connectedUserSubject.next(connectedUser);
  }

  /* *************************************************************************************** */
  /*                            HTTP Functions                                               */

  /* *************************************************************************************** */

  /**
   * Get the list of users
   *
   * @returns {Observable<User[]>} The list of users
   */
  getAll(): Observable<User[]> {
    return this._httpClient.get<User[]>(`${UserService._USERS_BASE_URL}`);
  }

  /**
   * Get a user by id
   *
   * @param {string} userId The user id to find
   * @returns {Observable<User>} The user found
   */
  getById(userId: string): Observable<User> {
    return this._httpClient.get<User>(`${UserService._USERS_BASE_URL}/${userId}`);
  }

  /**
   * Get the connected user
   *
   * @returns {Observable<User>} The connected user
   */
  getConnectedUser(): Observable<User> {
    return this._httpClient.get<User>(`${UserService._USERS_BASE_URL}/current`).pipe(
        map(user => {
          this.connectedUser = user;
          return user;
        })
    );
  }

  /**
   * Delete a user
   * @param {User} user The user to delete
   */
  deleteUser(user: User): Observable<User> {
    return this._httpClient.delete<User>(`${UserService._USERS_BASE_URL}/${user.id}`);
  }

  /**
   * Update a user
   *
   * @param {User} user The user to update
   * @returns {Observable<User>} The user updated
   */
  updateUser(user: User): Observable<User> {
    return this._httpClient.put<User>(`${UserService._USERS_BASE_URL}/${user.id}`, user)
        .pipe(
            map(userUpdated => {
              if (userUpdated.id === this._connectedUserSubject.getValue().id) {
                this.connectedUser = userUpdated;
              }
              return userUpdated;
            })
        );
  }

  /**
   * Update user settings
   *
   * @param {User} user The user to update
   * @param {UserSetting[]} userSettings The new settings
   * @returns {Observable<User>} The user updated
   */
  updateUserSettings(user: User, userSettings: UserSetting[]): Observable<User> {
    const url = `${UserService._USERS_BASE_URL}/${user.id}/settings`;

    return this
        ._httpClient
        .put<User>(url, userSettings)
        .pipe(
            map(userUpdated => {
              if (userUpdated.id === this._connectedUserSubject.getValue().id) {
                this.connectedUser = userUpdated;
              }
              return userUpdated;
            })
        );
  }

  /**
   * Search a list of users by username
   *
   * @param {string} username The username to find
   * @returns {Observable<User[]>} The list of users that match the string
   */
  searchUserByUsername(username: string): Observable<User[]> {
    return this._httpClient.get<User[]>(`${UserService._USERS_BASE_URL}/search?username=${username}`);
  }

  /* *************************************************************************************** */
  /*                            Other Help Functions                                         */

  /* *************************************************************************************** */

  /**
   * Get the initials of a user
   *
   * @param {User} user The user
   * @returns {string} The initials
   */
  getUserInitial(user: User): string {
    return `${user.firstname.substring(0, 1)}${user.lastname.substring(0, 1)}`;
  }

  /**
   * Test if the user is admin
   * @returns {boolean} True if the current user admin, false otherwise
   */
  isAdmin(): boolean {
    return this._tokenService.getUserRoles().includes(RoleEnum.ROLE_ADMIN);
  }
}
