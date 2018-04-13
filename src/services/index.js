// fetch
export {fetchGet, fetchPost, fetchMock} from './fetch';

// localStorage operations
export {lsGet, lsSet, lsRemove} from './localStorage';

// cookie operations
export {ckGet, ckSet, ckRemove} from './cookie';

// reference mapping
export {CAPACITY_UNIT_SIZE_MAP, TIME_UNIT_MILLISECOND_MAP, INTERVAL_LIST, METADATA_STATICS_ITEMS, STORAGE_STATICS_ITEMS} from './localData';

// format digit to Byte, KByte, MByte, GByte, TByte, PByte, EByte, ZByte .etc
export {formatStorageSize, formatNetworkSize} from './format/bytesToSize';

// format digit to time, date
export {timeLeftFormat, timeFormat} from './format/time';

// case
export {someUpperCase} from './format/toUpperCase';

// validation
export {validateIpv4, validateFsName, validateEmail, validatePort, validateNotZeroInteger} from './validation';

// key press filter
export {KeyPressFilter} from './keyPressFilter';