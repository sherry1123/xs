// fetch
export {fetchGet, fetchPost, fetchMock} from './fetch';

// localStorage operations
export {lsGet, lsSet, lsRemove} from './localStorage';

// cookie operations
export {ckGet, ckSet, ckRemove} from './cookie';

// reference mapping
export {CAPACITY_UNIT_SIZE_MAP, Time_UNIT_MILLISECOND_MAP, INTERVAL_LIST} from './localData';

// format digit to Byte, KByte, MByte, GByte, TByte, PByte, EByte, ZByte .etc
export {formatStorageSize, formatNetworkSize} from './format/bytesToSize';

// format digit to time, date
export {timeLeftFormat, timeFormat} from './format/time';

// validation
export {validateIpv4, validateFsName, validateEmail, validatePort} from './validation';

// key press filter
export {KeyPressFilter} from './keyPressFilter';