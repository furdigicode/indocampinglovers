export const updateTypes = ["general","price","facility","access","contact","location","operating_status","photo"] as const;
export type CampgroundUpdateType = typeof updateTypes[number];

export type CampgroundUpdateSubmissionInput = {
  campgroundId:string; updateType:CampgroundUpdateType; proposedChange:string;
  submitterName:string; submitterContact:string; consent:boolean; idempotencyKey:string;
};

export function parseCampgroundUpdateSubmission(raw:unknown):CampgroundUpdateSubmissionInput {
  if(!raw||typeof raw!=="object") throw new Error("invalid");
  const x=raw as Record<string,unknown>;
  const text=(key:string,max:number)=>{const v=typeof x[key]==="string"?x[key].trim():"";if(!v||v.length>max)throw new Error("invalid");return v};
  const campgroundId=text("campgroundId",36);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(campgroundId))throw new Error("invalid");
  const updateType=x.updateType;
  if(typeof updateType!=="string"||!updateTypes.includes(updateType as CampgroundUpdateType))throw new Error("invalid");
  const proposedChange=text("proposedChange",4000);
  if(proposedChange.length<10)throw new Error("invalid");
  const submitterName=text("submitterName",120);
  const submitterContact=text("submitterContact",200);
  if(x.consent!==true)throw new Error("invalid");
  const idempotencyKey=text("idempotencyKey",100);
  if(!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey))throw new Error("invalid");
  return {campgroundId,updateType:updateType as CampgroundUpdateType,proposedChange,submitterName,submitterContact,consent:true,idempotencyKey};
}
