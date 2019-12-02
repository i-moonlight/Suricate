/*
 *  /*
 *  * Copyright 2012-2018 the original author or authors.
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

import { RoleEnum } from '../../../enums/role.enum';

/**
 * Represent the access token decoded
 */
export interface AccessTokenDecoded {
  /**
   * Unique identifier of the token
   */
  jti: string;
  /**
   * The OAuth2 client id
   */
  client_id: string;
  /**
   * The scope the token (read, write)
   */
  scope: ['read'] | ['write'] | ['read', 'write'];
  /**
   * The expiration date as long
   */
  exp: number;
  /**
   * The username
   */
  user_name: string;
  /**
   * User firstname
   */
  firstname: string;
  /**
   * User mail
   */
  lastname: string;
  /**
   * User mail
   */
  mail: string;
  /**
   * The list of roles of the user
   */
  authorities: RoleEnum[];
}
