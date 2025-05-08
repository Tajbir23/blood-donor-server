const hasBloodGroup = (bloodGroup: string) => {
    console.log("bloodGroup", bloodGroup, "hasBloodGroup");
    return bloodGroup === "A+" || bloodGroup === "A-" || bloodGroup === "B+" || bloodGroup === "B-" || bloodGroup === "AB+" || bloodGroup === "AB-" || bloodGroup === "O+" || bloodGroup === "O-";
}

export default hasBloodGroup;
