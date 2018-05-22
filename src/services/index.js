// localStorage operations
export {lsGet, lsSet, lsRemove, lsClearAll} from './localStorage';

// cookie operations
export {ckGet, ckSet, ckRemove} from './cookie';

// reference mapping
export {timeUnitMilliSecond, metadataStaticsItems, storageStaticsItems,} from './localData';

// format digit to Byte, KByte, MByte, GByte, TByte, PByte, EByte, ZByte .etc
export {formatStorageSize, formatNetworkSize} from './format/bytesToSize';

// format digit to time, date
export {timeLeftFormat, timeFormat} from './format/time';

// calculate capacity bar color
export {getCapacityColour} from './format/capacityColour';

// case
export {someUpperCase} from './format/toUpperCase';

// cut string
export {cutString} from './format/cutString';

// validation
export {validateIpv4, validateIpv4Segment, validateFsName, validateEmail, validatePassword, validateNotZeroInteger, validatePositiveInteger} from './validation';

// key press filter
export {KeyPressFilter} from './keyPressFilter';