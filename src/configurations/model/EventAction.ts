import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import SolarSystemModelsNamespace from "../../SolarSystemModelsNamespace.js";

export class EventAction extends EnumerationValue {
  public static readonly RUN = new EventAction();
  public static readonly PAUSE = new EventAction();
  public static readonly STOP = new EventAction();
  public static readonly enumeration = new Enumeration(EventAction);
}

SolarSystemModelsNamespace.register("EventAction", EventAction);
