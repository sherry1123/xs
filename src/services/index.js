// fetch
export {fetchGet, fetchPost, fetchMock} from './fetch';

// localStorage
export {lsGet, lsSet, lsRemove} from './localStorage';

// reference mapping
export {CAPACITY_UNIT_SIZE_MAP, Time_UNIT_MILLISECOND_MAP, INTERVAL_LIST} from './localData';

// format digit to byte, kb, mb, gb, tb, pb ,zb, .etc
export {formatStorageSize, formatNetworkSize} from './format/bytesToSize';

// format digit to time, date
export {timeLeftFormat, timeFormat} from './format/time';

// validation
export {
    validateFCInitiator, validateStandardName, validateEmptyObject, validateVolumeName, validateTargetName,
    validateExtensionName, validateIpWithWc, validateIpv4, validateIpSplCase, validateIpv6, validateIQN, validateMac,
    validateDomain, validateFirstName, validateLastName, validateEmail, validatePort, validateUsername, validateCephName,
    validateFirstLastname, subnetParser, checkRanges, getSubnetReg, getPortReg, getIPRangeReg, getIPReg, getIPv6Reg,
    getMACReg, getNetMasks, getVolumeNameReg, getPositiveFloatReg, getEmailAddressReg, getInternationalPhoneReg,
    getPassStrengthRegs, subnetValidation, checkOverLap, subnetOverlap, checkIpInSubnet, numberToNetmask,
    checkSerialNumberDup, validateNFSV4MountPath,  checkPortInput, validatePassword, checkImageNumber, validataTargetName
} from './validation';

// config
export {TABLE_LOCALE} from './config';

// random
export {randomBoolean} from './random';