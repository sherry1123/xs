/**
 * Format validation
 * IP, MAC, Domain, Subnet, Port, Net Mask
 */

const VALIDATE_POSITIVE_INTEGER = /^[1-9]+[0-9]*]*$/;
const VALIDATE_IPV4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const VALIDATA_IPV4_SEGMENT = /^((?:(?:[01]?\d?\d|2(?:[0-4]\d|5[0-5]))\.){2}(?:[01]?\d?\d|2(?:[0-4]\d|5[0-5])))(?:(?:\.(?:[01]?\d?\d|2(?:[0-4]\d|5[0-5])))(\/(?:(?:[01]?\d?\d|2(?:[0-4]\d|5[0-5]))))?|(\/(?:(?:[01]?\d?\d|2(?:[0-4]\d|5[0-5])))\.(?:(?:[01]?\d?\d|2(?:[0-4]\d|5[0-5])))))$/;
/* SPL_IP regex to restrict 127.*.*.* and 0.0.0.0 entry */
const SPL_IP1 = /^127\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]|[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const SPL_IP2 = /^0\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]|[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const VALIDATE_PARTIAL_IP = /^(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){0,3}(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))?$/;
const VALIDATE_IPV6 = /^((?=.*::)(?!.*::.+::)(::)?([\dA-Fa-f]{0,4}:(:|\b)|){5}|([\dA-Fa-f]{0,4}:){6})((([\dA-Fa-f]{0,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/;
const VALIDATE_MAC = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
const VALIDATE_DOMAIN = /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i;
const VALIDATE_IP_RANGE = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
const VALIDATE_SUBNET_SIZE = /^[0-9]+$/;
const VALIDATE_SUBNET = /^((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((1|2|3(?=1|2))\d|\d))\b$/;
const VALIDATE_PORT = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
const VALIDATE_PORT_INPUT = /^([0-9]+((\s*)(,|:)(\s*)[0-9]+(\s*))*)$/;
const VALIDATE_STD_NAME = /^([a-z-A-Z0-9])+([a-zA-Z0-9,_.-])*$/; // Standard name starts with either letters or digits
const VALIDATE_VOLUME_NAME = /^([a-z-A-Z])([a-zA-Z0-9_])+$/; //VOLUME MUST START WITH LETTERS, VOLUME CANNOT CONTAIN DOT
const VALIDATE_TARGET_NAME = /^([a-z-A-Z])([a-zA-Z0-9_.-])+$/; //SAME RULES AS VOLUME NAME
const VALIDATE_EXTENSION_NAME = /^([.])([a-zA-Z0-9])+([.]([a-zA-Z0-9])+)*$/; //EXTENSION MUST START WITH .
const VALIDATE_POSITIVE_FLOAT = /^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$/;
const VALIDATE_NAME_ADDRESS = /^[a-zA-Z0-9]*$/;
const VALIDATE_EMAIL_ADDRESS = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
const VALIDATE_INTERNATIONAL_PHONE = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
const VALIDATE_IQN = /^(?:iqn\.\d{4}-[0-1][0-9](?:\.[A-Za-z]+\.(?:[A-Za-z0-9.-]*[A-Za-z0-9])?)+(?::[A-Za-z0-9.\-^:]+)?|eui\.[0-9A-Fa-f]{16})$/;
const NOT_ALLOWED_CHAR = /[ !@#$%^&*()+=[\]{};':"\\|,.<>?]/;
// Minimum 8 characters at least 1 Alphabet and 1 Number
const PASS_STRONG_REGEXP = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
// Minimum 8 characters at least 1 Alphabet and 1 Number and 1 Special Character
const PASS_MEDIUM_REGEXP = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
// Minimum 6 characters
const PASS_ENOUGH_REGEXP = /(?=.{6,}).*/;
// Begin with letter and can contain underscore and dot. No special characters allowed.
const VALIDATE_USERNAME = /^[a-zA-Z0-9]{1,15}([-_.]?[a-zA-Z0-9]){2,15}$/;
// Path name can't start with a splash or point.
const VALIDATE_PATHNAME = /^[a-zA-Z0-9_]{1,30}$/;
// Name can only contains letter, number and underscore(except for the first),  length is 3-30.
const VALIDATE_FS_NAME = /^([a-zA-Z0-9])\w{2,29}$/;
//First name and Last name can only contain letter, no special characters allowed except hyphen or space.
const VALIDATE_FIRSTLASTNAME = /^[a-zA-Z]+([-|\s]?[a-zA-Z])*$/;
const VALIDATE_PASSWORD = /^([a-zA-Z0-9])\w{5,17}$/;
const VALIDATE_NOT_ZERO_INTEGER = /^[1-9]\d*$/;
const VALIDATE_TARGETNAME = /^[a-zA-Z0-9]{3,30}$/;
const VALIDATE_FC_INITIATOR = /^(?:(?:[0-9]|[a-f]){2}:){7}(?:[0-9]|[a-f]){2}$/;
const VALIDATE_NET_MASKS = [
    '0.0.0.0',
    '128.0.0.0',
    '192.0.0.0',
    '224.0.0.0',
    '240.0.0.0',
    '248.0.0.0',
    '252.0.0.0',
    '254.0.0.0',
    '255.0.0.0',
    '255.128.0.0',
    '255.192.0.0',
    '255.224.0.0',
    '255.240.0.0',
    '255.248.0.0',
    '255.252.0.0',
    '255.254.0.0',
    '255.255.0.0',
    '255.255.128.0',
    '255.255.192.0',
    '255.255.224.0',
    '255.255.240.0',
    '255.255.248.0',
    '255.255.252.0',
    '255.255.254.0',
    '255.255.255.0',
    '255.255.255.128',
    '255.255.255.192',
    '255.255.255.224',
    '255.255.255.240',
    '255.255.255.248',
    '255.255.255.252',
    '255.255.255.254',
    '255.255.255.255'
];

export const validatePositiveInteger = text => {
    if (!text){
        return false;
    }
    return VALIDATE_POSITIVE_INTEGER.test(text);
};

export const validateFCInitiator = initiator => {
    return initiator && initiator.match(VALIDATE_FC_INITIATOR);
};

//Returns false if the path is invalid
export const validateNFSV4MountPath = path => {
    if (!path || path.charAt(0) !== '/'){
        return false;
    }
    return !NOT_ALLOWED_CHAR.test(path);
};

export const validateIQN = iqn => {
    if (!iqn){
        return false;
    }
    return iqn.match(VALIDATE_IQN);
};

//Returns false if the name is invalid
export const validateStandardName = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_STD_NAME);
};

//Returns true if object is empty
export const validateEmptyObject = obj => {
    for (let key in obj){
        if(obj.hasOwnProperty(key)){
            return false;
        }
    }
    return true;
};

//Returns false if volume name is invalid
export const validateVolumeName = name => {
    if(!name){
        return false;
    }
    return name.match(VALIDATE_VOLUME_NAME);
};

export const validateTargetName = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_TARGET_NAME);
};

export const validateExtensionName = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_EXTENSION_NAME);
};

export const validateIpWithWc = ip => {
    let asteriskPos = ip.indexOf('*');
    // Rules: Maximum 1 asterisk, and it should be the last character in the ip
    // Also: We can use empty dot to represent asterisk: 10.0.30.
    // 10.* valid; 10.*.13 not valid
    if (asteriskPos>-1 && asteriskPos!==ip.length-1){
        return false;
    } else {
        let modip = ip.replace('*', '250');
        return modip.match(VALIDATE_PARTIAL_IP);
    }
};

// Returns false to ip format error
export const validateIpv4 = ip => {
    if (!ip){
        return false;
    }
    return ip.match(VALIDATE_IPV4);
};

export const validateIpv4Segment = segment => {
    if (!segment){
        return false;
    }
    return segment.match(VALIDATA_IPV4_SEGMENT);
};

//This function is to restrict the ip starting with 127.*.*.* or 0.0.0.0
export const validateIpSplCase = ip => {
    if (ip.match(SPL_IP1) || ip.match(SPL_IP2)){
        return false;
    }
    return true;
};

// Returns false to ipv6 format error
export const validateIpv6 = ipv6 => {
    if (!ipv6){
        return false;
    }
    return ipv6.match(VALIDATE_IPV6);
};

// Returns false to mac format error
export const validateMac = mac => {
    if (!mac){
        return false;
    }
    return mac.match(VALIDATE_MAC);
};

export const validateFirstName = adminFirstName => {
    if (!adminFirstName){
        return false;
    }
    return adminFirstName.match(VALIDATE_NAME_ADDRESS);
};

export const validateLastName = adminLastName => {
    if (!adminLastName){
        return false;
    }
    return adminLastName.match(VALIDATE_NAME_ADDRESS);
};

export const validateEmail = email => {
    if (!email){
        return false;
    }
    return email.match(VALIDATE_EMAIL_ADDRESS);
};

export const validateUsername = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_USERNAME);
};

export const validatePathname = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_PATHNAME);
};

export const validateFsName = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_FS_NAME);
};

export const validateFirstLastname = name => {
    if (!name){
        return false;
    }
    return name.match(VALIDATE_FIRSTLASTNAME);
};

// Returns false to domain format error
export const validateDomain = domain => {
    if (!domain){
        return false;
    }
    return domain.match(VALIDATE_DOMAIN);
};

export const validatePort = port => {
    if (!port){
        return false;
    }
    if (typeof port !== 'string'){
        port = port.toString();
    }
    return port.match(VALIDATE_PORT);
};

// Returns expression
export const getSubnetReg = () => {
    return VALIDATE_SUBNET;
};

// Returns expression
export const getPortReg = () => {
    return VALIDATE_PORT;
};

// Returns expression
export const getIPRangeReg = () => {
    return VALIDATE_IP_RANGE;
};

// Returns expression
export const getIPReg = () => {
    return VALIDATE_IPV4;
};

// Returns expression
export const getIPv6Reg = () => {
    return VALIDATE_IPV6;
};

// Returns expression
export const getMACReg = () => {
    return VALIDATE_MAC;
};

// Returns valid list
export const getNetMasks = () => {
    return VALIDATE_NET_MASKS;
};

// Returns expression
export const getVolumeNameReg = () => {
    return VALIDATE_VOLUME_NAME;
};

// Returns expression
export const getPositiveFloatReg = () => {
    return VALIDATE_POSITIVE_FLOAT;
};

// Returns expression
export const getEmailAddressReg = () => {
    return VALIDATE_EMAIL_ADDRESS;
};

// Returns expression
export const getInternationalPhoneReg = () => {
    return VALIDATE_INTERNATIONAL_PHONE;
};

// Returns expression
export const getPassStrengthRegs = () => {
    return {strong: PASS_STRONG_REGEXP, medium: PASS_MEDIUM_REGEXP, enough: PASS_ENOUGH_REGEXP};
};

export const numberToNetmask = n => {
    return VALIDATE_NET_MASKS[n];
};

export const subnetParser = (validator, object, ip, alldevice) => {
    let netMask = '',
        maskNumerals = ip.split('/');
    object.ip = maskNumerals[0];
    if ((maskNumerals.length === 2) && maskNumerals[0].match(VALIDATE_IPV4) && maskNumerals[1] && maskNumerals[1].match(VALIDATE_SUBNET_SIZE) && maskNumerals[1] <= 32 && maskNumerals[1] > 7){
        let binaryRef = '';
        let shift = 32 - parseInt(maskNumerals[1], 0);
        maskNumerals[1] = parseInt(maskNumerals[1], 0);
        let nm = 0;
        for (; nm < 4; nm++){
            let maskBits = (() => {
                if (maskNumerals[1] > 0){
                    maskNumerals[1] = maskNumerals[1] - 8;
                    if (maskNumerals[1] > 0){
                        return Array(9).join("1");
                    } else {
                        return Array(maskNumerals[1] + 9).join("1") + Array(1 - maskNumerals[1]).join("0");
                    }
                } else {
                    return  "0";
                }
            })();
            netMask = netMask + parseInt(maskBits, 2).toString();
            if ((nm !== 3)){
                netMask = netMask + '.';
            }
        }
        let ipNumber = object.ip.split('.');
        for (nm = 0; nm < ipNumber.length; nm ++){
            let inter = (ipNumber[nm] >>> 0).toString(2);
            binaryRef = binaryRef + Array(9 - inter.length).join("0") + inter;
        }
        validator.invalidRange = checkRanges(object.deviceId, binaryRef, shift, alldevice);
    } else {
        validator.invalidRange = false;
    }
    object.netMask = netMask;
};

// return false if invalid
export const subnetValidation = subnetIp => {
    if (!subnetIp){
        return false;
    }
    let maskNumerals = subnetIp.split('/');
    if (maskNumerals.length === 2 && maskNumerals[0].match(VALIDATE_IPV4) && maskNumerals[1] && maskNumerals[1] <= 32 && maskNumerals[1] >= 8){
        return true;
    }
    return false;
};

// check if two subnet ips are overlapping
export const checkOverLap = (subnetIp1, subnetIp2) => {
    if (!subnetIp1 || !subnetIp2){
        return false;
    }
    let tmp = subnetIp1.split('/');
    let ip1 = tmp[0];
    let mask1 = tmp[1];
    tmp = subnetIp2.split('/');
    let ip2 = tmp[0];
    let mask2 = tmp[1];
    tmp = ip1.split('.');
    let intNotaion1 = ((parseInt(tmp[0], 0) & 0xFF) << 24) | ((parseInt(tmp[1], 0) & 0xFF) << 16) | ((parseInt(tmp[2], 0) & 0xFF) << 8) | ((parseInt(tmp[3], 0) & 0xFF) << 0);
    tmp = ip2.split('.');
    let intNotaion2 = ((parseInt(tmp[0], 0) & 0xFF) << 24) | ((parseInt(tmp[1], 0) & 0xFF) << 16) | ((parseInt(tmp[2], 0) & 0xFF) << 8) | ((parseInt(tmp[3], 0) & 0xFF) << 0);
    if ((intNotaion1 & (0xFFFFFFFF << (32 - mask1))) === (intNotaion2 & (0xFFFFFFFF << (32 - mask1)))){
        return true;
    }
    if ((intNotaion1 & (0xFFFFFFFF << (32 - mask2))) === (intNotaion2 & (0xFFFFFFFF << (32 - mask2)))){
        return true;
    }
    return false;
};

// check if the ip and subnetIp are overlapping
export const ipInSubnet = (subnetIp, ip) => {
    if (!subnetIp || !ip) {
        return false;
    }
    let tmp = subnetIp.split('/');
    let sub_ip = tmp[0];
    let mask = tmp[1];
    tmp = sub_ip.split('.');
    let intNotaion1 = ((parseInt(tmp[0], 0) & 0xFF) << 24) | ((parseInt(tmp[1], 0) & 0xFF) << 16) | ((parseInt(tmp[2], 0) & 0xFF) << 8) | ((parseInt(tmp[3], 0) & 0xFF) << 0);
    tmp = ip.split('.');
    let intNotaion2 = ((parseInt(tmp[0], 0) & 0xFF) << 24) | ((parseInt(tmp[1], 0) & 0xFF) << 16) | ((parseInt(tmp[2], 0) & 0xFF) << 8) | ((parseInt(tmp[3], 0) & 0xFF) << 0);
    if ((intNotaion1 & (0xFFFFFFFF << (32 - mask))) === (intNotaion2 & (0xFFFFFFFF << (32 - mask)))){
        return true;
    }
    return false;
};

//check if the subnet ip overlaps with any of the subnets or ip in the device list (Including the devices have not been saved)
export const subnetOverlap = (device, deviceList, subnetIp) => {
    for (let i = 0; i < deviceList.length; i++){
        let tmp = deviceList[i];
        if ((!device.deviceId || device.deviceId === '') && (!tmp.deviceId || tmp.deviceId === '')){
            if (device.key === tmp.key){
                continue;
            }
        } else {
            if (device.deviceId === tmp.deviceId){
                continue;
            }
        }
        if (tmp.iconType === 'subnet'){
            if (checkOverLap(subnetIp, ((tmp.deviceId && tmp.deviceId !== '') ? tmp.devicePorts[0].portIp : tmp.subnetIp))){
                return true;
            }
        } else {
            if (tmp.category === 'FACTORY_DEVICE'){
                for (let j = 0; j < tmp.devicePorts.length; j++){
                    if (tmp.devicePorts[j].portIp && tmp.devicePorts[j].isMgmtPort && ipInSubnet(subnetIp, tmp.devicePorts[j].portIp)){
                        return true;
                    }
                }
            } else {
                // need to get management port
                if (tmp.devicePorts.length){
                    for (let k = 0; k < tmp.devicePorts.length; k ++){
                        let port = tmp.devicePorts[k];
                        if (port.isMgmtPort && port.portIp && ipInSubnet(subnetIp, port.portIp)){
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
};

// check ip is in any of the subnets (Including the subnets have not been saved), assume that if the device type is subnet, it has only one port
export const checkIpInSubnet = (ip, deviceList) => {
    for (let i = 0; i < deviceList.length; i++){
        let tmp = deviceList[i];
        if (tmp.iconType === 'subnet') {
            if (!tmp.deviceId || tmp.deviceId === ''){
                if (tmp.subnetIp && ipInSubnet(tmp.subnetIp, ip)){
                    return true;
                }
            } else {
                if (tmp.devicePorts.length && tmp.devicePorts[0].isMgmtPort && ipInSubnet(tmp.devicePorts[0].portIp, ip)){
                    return true;
                }
            }
        }
    }
    return false;
};

// return false if given serial number has duplicate in the device list
export const checkSerialNumberDup = (deviceList, sn, deviceId) => {
    for (let i = 0; i < deviceList.length; i++) {
        let tmp = deviceList[i];
        if (tmp.deviceId !== deviceId && tmp.serialNumber === sn){
            return false;
        }
    }
    return true;
};

export const checkRanges = (deviceId, ip, shift, deviceList) => {
    let inRange = false;
    for (let index = 0; index < deviceList.length; index ++){
        if ((deviceList[index].category === 'FACTORY_DEVICE') && deviceList[index].ip && ((deviceId) ? deviceList[index].deviceId !== deviceId : true) && deviceList[index].iconType !== 'cloud') {
            let actualShift = shift;

            if (deviceList[index].iconType === "subnet" && (32 - deviceList[index].subnetIp.split('/')[1]) > shift){
                actualShift = (32 - deviceList[index].subnetIp.split('/')[1]);
            }

            let binaryIp = '',
                ipNumber = deviceList[index].ip.split('.');
            for (let nm = 0; nm < ipNumber.length; nm++){
                let inter = (ipNumber[nm] >>> 0).toString(2);
                binaryIp = binaryIp + Array(9 - inter.length).join("0") + inter;
            }
            // Assume that checkranges called after duplication has passed without error
            if (ip === binaryIp) {
                continue;
            }
            inRange = (parseInt(ip, 2) >>> actualShift) === (parseInt(binaryIp, 2) >>> actualShift);

            if (inRange){
                return inRange;
            }
        }
    }
    return inRange;
};

export const checkPortRange = input => {
    let lst = input.split(':');
    if (lst.length !== 2){
        return false;
    }
    let arr = [];
    for (let i = 0; i < 2; i++){
        let tmp = lst[i].trim();
        if (!tmp.match(/^[0-9]+$/)){
            return false;
        }
        let t = parseInt(tmp, 0);
        if (t < 1 || t > 65535){
            return false;
        }
        arr.push(t);
    }
    if (arr[0] > arr[1]){
        return false;
    }
    return true;
};

export const checkPortInput = input => {
    if (input.match(VALIDATE_PORT_INPUT)){
        let lst = input.split(',');
        for (let i = 0; i < lst.length; i++){
            let tmp = lst[i].trim();
            if (tmp.match(/^[0-9]+$/)){
                let t = parseInt(tmp, 0);
                if (t < 1 || t > 65535){
                    return false;
                }
            } else if (tmp.match(/^[0-9]+:[0-9]+$/)){
                if (!checkPortRange(tmp)){
                    return false;
                }
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
};

export const validatePassword = password => {
    if (!password){
        return false;
    }
    return password.match(VALIDATE_PASSWORD);
};

export const validateNotZeroInteger = num => {
    if (!num){
        return false;
    }
    return VALIDATE_NOT_ZERO_INTEGER.exec(num);
};

export const validataTargetName = name => {
    if(!name){
        return false;
    }
    return VALIDATE_TARGETNAME.exec(name);
};