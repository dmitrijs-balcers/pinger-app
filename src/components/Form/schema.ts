import {
  boolean,
  mixed,
  number,
  object,
  string,
  NumberSchema,
  SchemaOf,
} from "yup";
import { TRANSLATION_MAP } from "./Form";

export type PRICE_TYPE = "TOTAL" | "SQM";

export interface PingerSchema {
  id?: string;
  email: string;
  category: keyof typeof TRANSLATION_MAP["category"];
  type: keyof typeof TRANSLATION_MAP["type"];
  price_min: number;
  price_max: number;
  price_type: keyof typeof TRANSLATION_MAP["price"];
  rooms_min?: number;
  rooms_max?: number;
  area_m2_min?: number;
  area_m2_max?: number;
  region: string;
  privacy_policy: boolean;
  frequency: keyof typeof TRANSLATION_MAP["frequency"];
  marketing?: boolean;
  unsubscribe_key?: string;
}

const positiveFormNumber = (): NumberSchema =>
  number()
    .positive()
    .integer()
    .transform((value?: string | number, originalValue?: string | number) =>
      String(originalValue).trim() === "" ? undefined : value,
    );

const moreThanEqualMin = (min: number | undefined, schema: NumberSchema) => {
  if (!min) {
    return schema;
  }
  return schema.min(min);
};

const schema: SchemaOf<PingerSchema> = object().shape({
  id: string().uuid().optional(),
  email: string().email().required(),
  category: mixed().oneOf(["APARTMENT", "HOUSE", "LAND"]).required(),
  type: mixed().oneOf(["SELL", "RENT", "AUCTION"]).required(),
  price_min: positiveFormNumber().required(),
  price_max: positiveFormNumber()
    .required()
    .when("price_min", moreThanEqualMin)
    .max(10000000),
  price_type: mixed().oneOf(["TOTAL", "SQM"]).required(),
  rooms_min: positiveFormNumber(),
  rooms_max: positiveFormNumber().when("rooms_min", moreThanEqualMin).max(20),
  area_m2_min: positiveFormNumber(),
  area_m2_max: positiveFormNumber()
    .when("area_m2_min", moreThanEqualMin)
    .when("category", (category: string, schema: NumberSchema) =>
      schema.max(category === "LAND" ? 1000000 : 1000),
    ),
  region: string()
    .required()
    .matches(/^(-?[0-9]{1,3}\.[0-9]+ -?[0-9]{1,3}\.[0-9]+(, )?)+$/, {
      message: "Lūdzu izvēlies reģionu",
    }),
  frequency: mixed()
    .oneOf(["IMMEDIATE", "DAILY", "WEEKLY", "MONTHLY"])
    .required(),
  privacy_policy: boolean()
    .required()
    .oneOf(
      [true],
      "Lai izveidotu jaunu PINGERi, ir jāpiekrīt lietošanas noteikumiem un privātuma politikai",
    ),
  marketing: boolean(),
  unsubscribe_key: string().optional(),
});

export default schema;
