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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {assetsApiEndpoint} from '../../../app.constant';

/**
 * Manage the asset http calls
 */
@Injectable()
export class HttpAssetService {

  /**
   * Constructor
   *
   * @param httpClient the http client to inject
   */
  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get the content of an asset
   *
   * @param assetToken The asset token
   */
  getUrlContent(assetToken: string): string {
    return assetToken ? `${assetsApiEndpoint}/${assetToken}` : ``;
  }
}