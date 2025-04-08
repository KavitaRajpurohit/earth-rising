export function getQueryOptions(query: any) {
    const page = query.page * 1 || 1;
    const limit = query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const sCategory = query.sCategory;
    const tribe = query.search;
    const type= query.sType;
    let sort: any = {};
    if (query.sortBy) {
        let sortData = JSON.stringify(query.sortBy);
        sortData = query.sortBy.replace(/[{}""]/g, "")
        const parts = sortData.split(":");
        sort[parts[0]] = parseFloat(parts[1]);
    } else {
        sort = { createdAt: -1 };
    }
    return { limit, skip, sort, page , sCategory, tribe, type};
}