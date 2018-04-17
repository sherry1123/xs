// fetch
export {fetchGet, fetchPost, fetchMock} from './fetch';

// localStorage operations
export {lsGet, lsSet, lsRemove} from './localStorage';

// cookie operations
export {ckGet, ckSet, ckRemove} from './cookie';

// reference mapping
export {timeUnitMilliSecond, metadataStaticsItems, storageStaticsItems,} from './localData';

// format digit to Byte, KByte, MByte, GByte, TByte, PByte, EByte, ZByte .etc
export {formatStorageSize, formatNetworkSize} from './format/bytesToSize';

// format digit to time, date
export {timeLeftFormat, timeFormat} from './format/time';

// case
export {someUpperCase} from './format/toUpperCase';

// validation
export {validateIpv4, validateFsName, validateEmail, validatePassword, validateNotZeroInteger, validatePositiveInteger} from './validation';

// key press filter
export {KeyPressFilter} from './keyPressFilter';