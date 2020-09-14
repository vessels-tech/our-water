import * as React from "react";
import { Component } from "react";
import {
  View,
  Keyboard,
  ToastAndroid,
  ScrollView,
  Alert,
  Dimensions
} from "react-native";
import { Navigation } from 'react-native-navigation';
import { Button } from "react-native-elements";
import { NavigationStacks, ResourceType } from '../../enums';
import {
  ConfigFactory,
  GroupSpecificationType
} from "../../config/ConfigFactory";
import BaseApi from "../../api/BaseApi";
import { SaveResourceResult } from "../../typings/models/OurWater";
import * as appActions from "../../actions";
import { AppState, CacheType } from "../../reducers";
import { connect } from "react-redux";
import {
  FormBuilder,
  Validators,
  FieldGroup,
  FieldControl,
  AbstractControl,
  ValidationErrors,
  FormGroup
} from "react-reactive-form";
import { SomeResult, ResultType } from "../../typings/AppProviderTypes";
import {
  TextInput,
  DropdownInput,
  TextIdInput
} from "../../components/common/FormComponents";
import { validateResource } from "../../api/ValidationApi";
import { MaybeExternalServiceApi } from "../../api/ExternalServiceApi";
import { SyncMeta } from "../../typings/Reducer";
import { AnyLoginDetails } from "../../typings/api/ExternalServiceApi";
import LoadLocationButton from "../../components/LoadLocationButton";
import { NoLocation, Location, LocationType } from "../../typings/Location";
import { fastDeepEqual as equal } from "../../utils/FastDeepEqual";
import { secondaryText, error1 } from "../../utils/Colors";
import { PendingResource } from "../../typings/models/PendingResource";
import { OrgType } from "../../typings/models/OrgType";
import {
  MaybeExtendedResourceApi,
  ExtendedResourceApiType,
  CheckNewIdResult
} from "../../api/ExtendedResourceApi";
import { TranslationFile } from "ow_translations/src/Types";
import { AnyResource } from "../../typings/models/Resource";
import { unwrapUserId, debounced, maybeLog, dismissModal } from '../../utils';
import { isNullOrUndefined } from "util";
//@ts-ignore
import { callingCountries } from "country-data";
import { validatePincode } from "../../utils/Pincodes";
import SaveButton from "../../components/common/SaveButton";
import FloatingButtonWrapper from "../../components/common/FloatingButtonWrapper";
import ImageComponent, {
  ImageType,
  IImage
} from "../../components/ImageComponent";
import { valid } from 'joi';

export interface Props {
  resourceId: string;
  config: ConfigFactory;
  appApi: BaseApi;
  resource?: AnyResource | PendingResource;

  //Injected by Consumer
  userId: string;
  pendingSavedResourcesMeta: SyncMeta;
  externalLoginDetails: AnyLoginDetails;
  externalLoginDetailsMeta: SyncMeta;
  location: Location | NoLocation;
  translation: TranslationFile;
  name: string | null;
  image: string | null;
  saveResource: (
    api: BaseApi,
    externalApi: MaybeExternalServiceApi,
    userId: string,
    resource: AnyResource | PendingResource
  ) => any;
  deletePendingResource: (
    api: BaseApi,
    userId: string,
    pendingResourceId: string
  ) => any;
}

export interface State {
  formHeight: number;
  scrollOffset: number;
}

export type EditResourceFormBuilder = {
  id: any;
  name: any;
  lat: any;
  lng: any;
  asset: any;
  ownerName?: any;
  waterColumnHeight?: any;
  locationName?: any;
};

class EditResourceScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  extendedResourceApi: MaybeExtendedResourceApi;
  editResourceForm: any;
  countryList: Array<{ label: string; key: string; name: string }>;
  scrollView?: any;
  scrollTo: number = 0;
  image: IImage = { type: ImageType.NONE, url: "" };

  constructor(props: Props) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();
    this.extendedResourceApi = this.props.config.getExtendedResourceApi();
    //Key is a ISO 3166-2
    this.countryList = callingCountries.all
      .filter((c: any) => (c.emoji ? true : false))
      .map((c: any) => ({
        label: `${c.emoji} ${c.name}`,
        key: c.alpha2.toLowerCase(),
        name: c.name
      }));
    this.countryList.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });

    this.state = {
      formHeight: Dimensions.get("window").height,
      scrollOffset: 0
    };

    /* Binds */
    this.asyncIdValidator = this.asyncIdValidator.bind(this);
    this.pincodeValidator = this.pincodeValidator.bind(this);
    this.simplePincodeValidator = this.simplePincodeValidator.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.displayDeleteModal = this.displayDeleteModal.bind(this);
    this.handleSubmit = debounced(1000, this.handleSubmit);
    this.editResourceForm = FormBuilder.group(
      this.getFormBuilder(this.props),
      this.getGroupValidators()
    );

    /* Listeners */
    Keyboard.addListener("keyboardDidShow", this.keyboardDidShow.bind(this));

    if (this.props.image) {
      this.image = {
        type: ImageType.IMAGE,
        url: this.props.image
      };
    }
  }

  componentWillUnmount() {
    Keyboard.removeListener("keyboardDidShow", this.keyboardDidShow);
  }

  /**
   * Listeners
   * //TD: these listeners aren't always removed properly
   */

  keyboardDidShow(event: any): void {
    //This is a hacky fix for the rn scrolling
    //We need to wait until the resize finished, otherwise scrollTo doesn't work.
    if (this.scrollView) {
      const scrollFunction = () => {
        maybeLog("scrolling to", this.scrollTo);
        this.scrollView.scrollTo({ x: 0, y: this.scrollTo, animated: true });
      };

      setTimeout(scrollFunction, 500);
    }
  }

  /**
   * Finished loading the location after the location button pressed
   * Update the form to reflect the lat and lng
   */
  loadLocationComplete(): void {
    if (this.props.location.type === LocationType.LOCATION) {
      this.editResourceForm.get('lat').setValue(`${this.props.location.coords.latitude.toFixed(4)}`);
      this.editResourceForm.get('lng').setValue(`${this.props.location.coords.longitude.toFixed(4)}`);
    }
  }

  /**
   * Set up the forms
   */
  getFormBuilder(props: Props): EditResourceFormBuilder {
    if (props.resource) {
      const builder = this.getEditFormBuilder(props.resource);
      return builder;
    }

    return this.getNewFormBuilder(props);
  }

  getEditFormBuilder(
    resource: AnyResource | PendingResource
  ): EditResourceFormBuilder {
    let id;
    let lat;
    let lng;
    let asset;
    let name;
    let ownerName;
    let waterColumnHeight;
    let locationName;
    id = [resource.id, Validators.required, this.asyncIdValidator];

    if (resource.pending) {
      lat = [`${resource.coords.latitude}`, Validators.required];
      lng = [`${resource.coords.longitude}`, Validators.required];
      asset = [resource.resourceType, Validators.required];
      ownerName = resource.owner && [resource.owner, Validators.required];
      name = resource.name && [resource.name, Validators.required];
      waterColumnHeight = resource.waterColumnHeight && [
        `${resource.waterColumnHeight}`
      ];
      locationName = [resource.locationName, Validators.required];

      return {
        id,
        name,
        lat,
        lng,
        asset,
        ownerName,
        waterColumnHeight,
        locationName
      };
    }

    if (resource.type === OrgType.GGMN) {
      lat = [`${resource.coords._latitude}`, Validators.required];
      lng = [`${resource.coords._longitude}`, Validators.required];
      asset = [resource.type, Validators.required];
      name = [resource.name];
      waterColumnHeight = [`${resource.waterColumnHeight}`];
      locationName = ['', Validators.required];
    }

    if (resource.type === OrgType.MYWELL) {
      lat = [`${resource.coords._latitude}`, Validators.required];
      lng = [`${resource.coords._longitude}`, Validators.required];
      asset = [resource.type, Validators.required];
      ownerName = [resource.owner.name, Validators.required];
      locationName = [resource.locationName, Validators.required];
    }

    return {
      id,
      name,
      lat,
      lng,
      asset,
      ownerName,
      waterColumnHeight,
      locationName
    };
  }

  getNewFormBuilder(props: Props): EditResourceFormBuilder {
    /* Set up the form */
    let lat = "";
    let lng = "";
    if (props.location.type === LocationType.LOCATION) {
      lat = `${props.location.coords.latitude.toFixed(4)}`;
      lng = `${props.location.coords.longitude.toFixed(4)}`;
    }

    const defaultResourceType = props.config.getAvailableResourceTypes()[0];

    const formBuilderGroup: any = {
      lat: [lat, Validators.required],
      lng: [lng, Validators.required],
      asset: [defaultResourceType, Validators.required],
      locationName: ["", Validators.required]
    };

    let ownerName = "";
    if (this.props.name) {
      ownerName = this.props.name;
    }

    /* Optional Validators, depending on config*/
    if (this.props.config.getEditResourceHasResourceName()) {
      formBuilderGroup["name"] = [""];
    }

    if (this.props.config.getEditResourceShouldShowOwnerName()) {
      formBuilderGroup["ownerName"] = [ownerName, Validators.required];
    }

    if (this.props.config.getEditResourceShouldShowOwnerName()) {
      formBuilderGroup["ownerName"] = [ownerName, Validators.required];
    }

    if (this.props.config.getEditResourceAllowCustomId()) {
      formBuilderGroup["id"] = ["", Validators.required, this.asyncIdValidator];
    }

    if (this.props.config.getEditResourceHasWaterColumnHeight()) {
      formBuilderGroup['waterColumnHeight'] = [''];
    }

    //Should we add pincode to the group?
    if (this.props.config.getEditResourceHasPincode()) {
      const pincodeGroupSpec = this.props.config.getAvailableGroupTypes().pincode;
      const validators: any[] = [""];

      if (pincodeGroupSpec.required) {
        validators.push(Validators.required);
      }

      formBuilderGroup["pincode"] = validators;

      //We are adding pincode do group, but should we validate the pincode per country?

      //moved to getGroupValidators
      // if (this.props.config.getEditResourceValidatesPincode()) {
      //   validators.push(this.pincodeValidator);
      // } else {
      //   validators.push(this.simplePincodeValidator);
      // }
    }

    if (this.props.config.getEditResourceHasCountry()) {
      //Default to india.
      const validators: any[] = ["in"];
      const countrySpec = this.props.config.getAvailableGroupTypes()["country"];
      if (countrySpec.required) {
        validators.push(Validators.required);
      }

      formBuilderGroup["country"] = validators;
    }
    return formBuilderGroup;
  }

  /**
   * Group validators are required for validating multiple fields together
   */
  getGroupValidators(): any {
    if (!this.props.config.getEditResourceValidatesPincode()) {
      return {};
    }

    return {
      validators: this.pincodeValidator("pincode", "country")
    };
  }

  async asyncIdValidator(control: AbstractControl) {
    const { new_resource_id_check_error } = this.props.translation.templates;

    if (control.value.length < 4) {
      //ew: don't like throwing as flow control
      throw { invalidId: true };
    }

    if (
      this.extendedResourceApi.extendedResourceApiType ===
      ExtendedResourceApiType.None
    ) {
      //Tried to check, but this call is invalid.
      return Promise.resolve(null);
    }

    const result = await this.extendedResourceApi.checkNewId(control.value);

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(new_resource_id_check_error, ToastAndroid.LONG);

      throw { invalidId: true };
    }

    if (result.result === CheckNewIdResult.Unavailable) {
      throw { invalidId: true };
    }

    return null;
  }

  pincodeValidator(pincodeId: string, countryId: string) {
    return (group: FormGroup): ValidationErrors | null => {
      const pincodeInput = group.controls[pincodeId];
      const countryInput = group.controls[countryId];

      const validateResult = validatePincode(
        countryInput.value,
        pincodeInput.value
      );

      if (validateResult.type === ResultType.ERROR) {
        pincodeInput.setErrors({ invalid: true });
        // throw { invalid: true };
      } else {
        pincodeInput.setErrors(null);
      }

      return null;
    };

    // //It's safe to access country here:
    // const pincode = control.value;
    // const country = this.editResourceForm.get('country').value;

    // const validateResult = validatePincode(country, pincode);
    // if (validateResult.type === ResultType.ERROR) {
    //   throw { invalid: true };
    // }

    // return null;
  }

  async simplePincodeValidator(control: AbstractControl) {
    //TODO: validate the pincode
    return null;
  }

  componentWillReceiveProps(newProps: Props) {
    const { location } = this.props;

    if (!equal(location, newProps.location)) {
      if (newProps.location.type === LocationType.LOCATION) {
        this.editResourceForm
          .get("lat")
          .setValue(`${newProps.location.coords.latitude.toFixed(4)}`);
        this.editResourceForm
          .get("lng")
          .setValue(`${newProps.location.coords.longitude.toFixed(4)}`);
      }
    }
  }

  handleSubmit = async () => {
    const {
      translation: {
        templates: {
          new_resource_saved_dialog,
          new_resource_saved_dialog_warning
        }
      }
    } = this.props;

    Keyboard.dismiss();

    let ownerName;
    if (this.props.config.getEditResourceShouldShowOwnerName()) {
      if (
        !isNullOrUndefined(this.editResourceForm.value.ownerName) &&
        this.editResourceForm.value.ownerName !== ""
      ) {
        ownerName = this.editResourceForm.value.ownerName;
      } else {
        ownerName = this.editResourceForm.value.id;
      }
    } else {
      ownerName = this.editResourceForm.value.id;
    }

    //TODO: make more type safe
    const unvalidatedResource: any = {
      //TODO: load the id?
      pending: true,
      coords: {
        latitude: this.editResourceForm.value.lat,
        longitude: this.editResourceForm.value.lng
      },
      resourceType: this.editResourceForm.value.asset,
      owner: {
        name: ownerName,
        createdByUserId: this.props.userId
      },
      locationName: this.editResourceForm.value.locationName,
      userId: this.props.userId,
      //TODO: load from default configs for each org + resource type
      timeseries: this.props.config.getDefaultTimeseries(
        this.editResourceForm.value.asset
      )
    };



    if (this.props.config.getEditResourceAllowCustomId()) {
      unvalidatedResource.id = this.editResourceForm.value.id;
    }

    if (
      this.props.config.getEditResourceHasWaterColumnHeight() &&
      this.editResourceForm.value.waterColumnHeight
    ) {
      unvalidatedResource.waterColumnHeight = this.editResourceForm.value.waterColumnHeight;
    }

    if (!this.editResourceForm.value.name) {
      unvalidatedResource.name = unvalidatedResource.id;
    } else {
      unvalidatedResource.name = this.editResourceForm.value.name;
    }

    /* Groups */
    const groups: CacheType<string> = {};
    const groupTypes = this.props.config.getAvailableGroupTypes();
    Object.keys(groupTypes).forEach(
      k => (groups[k] = this.editResourceForm.value[k])
    );
    unvalidatedResource.groups = groups;

    /* Image */
    unvalidatedResource.image = this.image.url || "";

    const validationResult: SomeResult<PendingResource> = validateResource(
      unvalidatedResource
    );
    if (validationResult.type === ResultType.ERROR) {
      ToastAndroid.show(
        `Error saving Resource: ${validationResult.message}`,
        ToastAndroid.SHORT
      );
      return;
    }

    const result: SomeResult<SaveResourceResult> = await this.props.saveResource(
      this.appApi,
      this.externalApi,
      this.props.userId,
      validationResult.result
    );

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(
        `Error saving Resource: ${result.message}`,
        ToastAndroid.SHORT
      );
      return;
    }

    let message = new_resource_saved_dialog;
    if (result.result.requiresLogin) {
      message = new_resource_saved_dialog_warning;
    }

    ToastAndroid.show(message, ToastAndroid.SHORT);
    await dismissModal();
  };

  displayDeleteModal() {
    const {
      edit_resource_delete_modal_title,
      edit_resource_delete_modal_text,
      edit_resource_delete_modal_ok,
      edit_resource_delete_modal_cancel
    } = this.props.translation.templates;

    Alert.alert(
      edit_resource_delete_modal_title,
      edit_resource_delete_modal_text,
      [
        { text: edit_resource_delete_modal_ok, onPress: this.handleDelete },
        { text: edit_resource_delete_modal_cancel, onPress: () => {} }
      ],
      { cancelable: true }
    );
  }

  async handleDelete() {
    if (this.props.resource) {
      this.props.deletePendingResource(
        this.appApi,
        this.props.userId,
        this.props.resource.id
      );
    }

    await dismissModal() // dismisses last shown modal
  }

  /**
   * getEditableGroupField
   *
   *
   * renders special-case group fields depending on the id
   */
  getEditableGroupField(spec: GroupSpecificationType) {
    const { general_is_required_error,country_label,
      pincode_invalid_message, } = this.props.translation.templates;

    //TODO: translate
    const labelForEditableField = (id: string) => {
      switch (id) {
        case "pincode": {
          return "Pincode *";
        }
        default:
          return id;
      }
    };

    //Change the keyboard type based on the country
    let pincodeKeyboardType = "default";
    //TODO: this doesn't get updated when it should be. Keep this to implement
    //dynamic keyboard switching later on.
    // if (this.editResourceForm.value && this.editResourceForm.value.country) {
    //   if (regexHasNumbersOnly(regexForIsoCode(this.editResourceForm.value.country))) {
    //     pincodeKeyboardType = 'numeric';
    //   }
    // }

    //TODO: change the country code for
    switch (spec.id) {
      case "country": {
        return (
          <FieldControl
            key={spec.id}
            name={spec.id}
            // @ts-ignore
            render={DropdownInput}
            meta={{
              options: this.countryList,
              editable: false,
              label: country_label,
              secureTextEntry: false,
              keyboardType: "default",
              defaultValue: "IN"
            }}
          />
        );
      }
      case "pincode": {
        return (
          <FieldControl
            key={spec.id}
            name={spec.id}
            render={TextInput}
            meta={{
              // onFocus: (event: any) => { this.scrollView && this.scrollView.scrollToEnd({ animated: false})},
              onFocus: (event: any) => {
                this.scrollTo = 380;
              },
              editable: true,
              label: labelForEditableField(spec.id),
              secureTextEntry: false,
              //It would be cool to change this depending on the selected country.
              //if the country only allows numbers, then open the number pad
              keyboardType: pincodeKeyboardType,
              errorMessage: general_is_required_error,
              asyncErrorMessage: pincode_invalid_message
            }}
          />
        );
      }
      default: {
        return (
          <FieldControl
            key={spec.id}
            name={spec.id}
            render={TextInput}
            meta={{
              editable: true,
              label: labelForEditableField(spec.id),
              secureTextEntry: false,
              errorMessage: general_is_required_error,
              keyboardType: "default"
            }}
          />
        );
      }
    }
  }

  /**
   * getEditableGroupsFields
   *
   * Loads a list of the editable groups that can be configured in the
   * remote config
   */
  getEditableGroupsFields() {
    if (Object.keys(this.props.config.getAvailableGroupTypes()).length === 0) {
      return null;
    }

    const groupList: GroupSpecificationType[] = Object.keys(
      this.props.config.getAvailableGroupTypes()
    )
      .map(key => this.props.config.getAvailableGroupTypes()[key])
      .sort((a, b) => a.order - b.order);

    return groupList.map(g => this.getEditableGroupField(g));
  }

  shouldShowWaterColumnHeight(assetType: ResourceType): boolean {
    if (!this.props.config.getEditResourceHasWaterColumnHeight()) {
      return false;
    }

    if (assetType === ResourceType.checkdam ||  assetType === ResourceType.well) {
      return true;
    }

    return false;
  }

  getForm() {
    const {
      pendingSavedResourcesMeta: { loading }
    } = this.props;

    const fixedButtonHeight = 100;

    const {
      new_resource_id,
      new_resource_id_check_taken,
      new_resource_lat,
      new_resource_lng,
      new_resource_owner_name_label,
      new_resource_submit_button,
      new_resource_asset_type_label,
      general_is_required_error,
      new_resource_name,
      new_resource_water_column_height,
      new_resource_location_name_label
    } = this.props.translation.templates;

    console.log(this.props.translation)

    //TODO: Translate
    const translate_resource_type = (type: ResourceType) => {
      switch (type) {
        case ResourceType.checkdam: return 'Check Dam';
        case ResourceType.well: return 'Well';
        case ResourceType.custom: return 'Custom';
        case ResourceType.quality: return 'Quality';
        case ResourceType.raingauge: return 'Raingauge';
      }
    }

    const localizedResourceTypes = this.props.config.getAvailableResourceTypes()
      .map((t: ResourceType) => ({
        key: t,
        label: translate_resource_type(t),
      }));

    return (
      <FieldGroup
        strict={false}
        control={this.editResourceForm}
        render={({ get, invalid, reset, value }) => (
          <View
            style={{
              flex: 1
            }}
          >
            <ScrollView
              ref={sv => (this.scrollView = sv)}
              style={{
                height: "100%",
                paddingBottom: fixedButtonHeight
              }}
              contentOffset={{ x: 0, y: this.state.scrollOffset }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps={"always"}
            >
              {this.props.config.getEditResourceAllowCustomId() ? (
                <FieldControl
                  name="id"
                  render={TextIdInput}
                  meta={{
                    //Don't allow user to edit existing resource ids
                    onFocus: (event: any) => {
                      this.scrollTo = 0;
                    },
                    editable: this.props.resource ? false : true,
                    label: new_resource_id,
                    secureTextEntry: false,
                    keyboardType: "default",
                    errorMessage: general_is_required_error,
                    asyncErrorMessage: new_resource_id_check_taken
                  }}
                />
              ) : null}
              {this.props.config.getEditResourceHasResourceName() ? (
                <FieldControl
                  name="name"
                  render={TextInput}
                  meta={{
                    editable: true,
                    onFocus: (event: any) => {
                      this.scrollTo = 0;
                    },
                    label: new_resource_name,
                    secureTextEntry: false,
                    keyboardType: "default"
                  }}
                />
              ) : null}
              <View
                style={{
                  flexDirection: "row"
                }}
              >
                <LoadLocationButton
                  style={{
                    alignSelf: "center"
                  }}
                  onComplete={() => this.loadLocationComplete()}
                />
                <FieldControl
                  name="lat"
                  render={TextInput}
                  meta={{
                    editable: true,
                    errorMessage: general_is_required_error,
                    label: new_resource_lat,
                    secureTextEntry: false,
                    keyboardType: "numeric"
                  }}
                />
                <FieldControl
                  name="lng"
                  render={TextInput}
                  meta={{
                    editable: true,
                    errorMessage: general_is_required_error,
                    label: new_resource_lng,
                    secureTextEntry: false,
                    keyboardType: "numeric"
                  }}
                />
              </View>
              <FieldControl
                name="asset"
                // @ts-ignore
                render={DropdownInput}
                meta={{
                  options: localizedResourceTypes,
                  editable: false,
                  label: new_resource_asset_type_label,
                  secureTextEntry: false,
                  keyboardType: "default",
                  errorMessage: general_is_required_error
                }}
              />
              {this.props.config.getEditResourceHasWaterColumnHeight() ? (
                <FieldControl
                  name="waterColumnHeight"
                  render={TextInput}
                  meta={{
                    editable: true,
                    label: new_resource_water_column_height,
                    secureTextEntry: false,
                    keyboardType: "numeric",
                    errorMessage: general_is_required_error
                  }}
                />
              ) : null}

              <FieldControl
                name="locationName"
                render={TextInput}
                meta={{
                  onFocus: (event: any) => {
                    this.scrollTo = 187;
                  },
                  editable: true,
                  label: new_resource_location_name_label,
                  secureTextEntry: false,
                  keyboardType: "default",
                  errorMessage: general_is_required_error
                }}
              />
              {this.props.config.getEditResourceShouldShowOwnerName() ? (
                <FieldControl
                  name="ownerName"
                  render={TextInput}
                  meta={{
                    onFocus: (event: any) => {
                      this.scrollTo = 195;
                    },
                    editable: true,
                    label: new_resource_owner_name_label,
                    secureTextEntry: false,
                    keyboardType: "default",
                    errorMessage: general_is_required_error
                  }}
                />
              ) : null}
              {this.getEditableGroupsFields()}

              <ImageComponent
                image={this.image}
                onImageUpdated={(newImage: IImage) => {
                  this.image = newImage;
                }}
              />

              {/* Transparent footer to make the scrollview balance */}
              <View
                style={{
                  height: fixedButtonHeight
                }}
              />
            </ScrollView>
            <FloatingButtonWrapper>
              <SaveButton
                loading={loading}
                disabled={invalid}
                title={new_resource_submit_button}
                height={50}
                onPress={this.handleSubmit}
              />
            </FloatingButtonWrapper>
          </View>
        )}
      />
    );
  }

  getDeleteButton() {
    const { edit_resource_delete_button } = this.props.translation.templates;

    return (
      <Button
        style={{
          paddingBottom: 20,
          minHeight: 50
        }}
        buttonStyle={{
          backgroundColor: error1,
          minHeight: 50
        }}
        textStyle={{
          color: secondaryText,
          fontWeight: "700"
        }}
        title={edit_resource_delete_button}
        onPress={this.displayDeleteModal}
      />
    );
  }

  render() {
    return (
      <View
        style={{
          flexDirection: "column",
          flex: 1
        }}
      >
        {this.getForm()}
        {this.props.resource && this.getDeleteButton()}
      </View>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    pendingSavedResourcesMeta: state.pendingSavedResourcesMeta,
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    location: state.location,
    translation: state.translation,
    name: state.name,
    userId: unwrapUserId(state.user)
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    saveResource: (
      api: BaseApi,
      externalApi: MaybeExternalServiceApi,
      userId: string,
      resource: AnyResource | PendingResource
    ) => dispatch(appActions.saveResource(api, externalApi, userId, resource)),
    deletePendingResource: (
      api: BaseApi,
      userId: string,
      pendingResourceId: string
    ) =>
      dispatch(appActions.deletePendingResource(api, userId, pendingResourceId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditResourceScreen);
