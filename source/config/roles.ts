import constant from "./constant";
const roles = [constant.ROLES.ADMIN, constant.ROLES.USER];
const roleRights = new Map();

roleRights.set(roles[0], ["changepassword"]);
roleRights.set(roles[1], ["singleProfileDetails", "editProfile"]);

export {
	roles,
	roleRights,
}

