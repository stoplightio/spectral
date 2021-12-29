import { oas2, oas3 } from "@stoplight/spectral-formats";
import { oas } from "@stoplight/spectral-rulesets";
export default {
  overrides: [
    {
      files: ["apis/*.json"],
      extends: oas,
      formats: [oas2, oas3],
    },
  ],
};
