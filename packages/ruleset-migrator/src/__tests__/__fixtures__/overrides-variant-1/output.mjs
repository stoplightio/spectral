import { oas } from "@stoplight/spectral-rulesets";
import { oas2, oas3 } from "@stoplight/spectral-formats";
export default {
  overrides: [
    {
      files: ["apis/*.json"],
      extends: oas,
      formats: [oas2, oas3],
    },
  ],
};
