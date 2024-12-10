<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\CoreExtension;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;
use Twig\TemplateWrapper;

/* @WebProfiler/Collector/logger.html.twig */
class __TwigTemplate_4a1149d80d0eec9ecfa393d5c435e163 extends Template
{
    private Source $source;
    /**
     * @var array<string, Template>
     */
    private array $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->blocks = [
            'head' => [$this, 'block_head'],
            'toolbar' => [$this, 'block_toolbar'],
            'menu' => [$this, 'block_menu'],
            'panel' => [$this, 'block_panel'],
        ];
    }

    protected function doGetParent(array $context): bool|string|Template|TemplateWrapper
    {
        // line 1
        return "@WebProfiler/Profiler/layout.html.twig";
    }

    protected function doDisplay(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Collector/logger.html.twig"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Collector/logger.html.twig"));

        $this->parent = $this->loadTemplate("@WebProfiler/Profiler/layout.html.twig", "@WebProfiler/Collector/logger.html.twig", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

    }

    // line 3
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_head(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "head"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "head"));

        // line 4
        yield "    ";
        yield from $this->yieldParentBlock("head", $context, $blocks);
        yield "

    <style>
        :root {
            --log-filter-active-num-color: #2563EB;
            --log-timestamp-color: #555;
        }
        .theme-dark {
            --log-filter-active-num-color: #2563EB;
            --log-timestamp-color: #ccc;
        }

        .log-filters {
            display: flex;
            flex-wrap: wrap;
        }
        .log-filters .log-filter {
            flex-shrink: 0;
            margin-right: 15px;
            position: relative;
        }
        .log-filters .log-filter summary {
            align-items: center;
            background: var(--button-background);
            border-radius: 6px;
            border: 1px solid var(--button-border-color);
            box-shadow: var(--button-box-shadow);
            color: var(--button-color);
            cursor: pointer;
            display: flex;
            font-size: 13px;
            font-weight: 500;
            padding: 4px 8px;
            white-space: nowrap;
        }
        .log-filters .log-filter summary:active {
            box-shadow: none;
            transform: translateY(1px);
        }
        .log-filters .log-filter summary .icon {
            height: 18px;
            width: 18px;
            margin: 0 7px 0 0;
        }
        .log-filters .log-filter summary svg {
            height: 18px;
            width: 18px;
            opacity: 0.7;
        }
        .log-filters .log-filter summary svg {
            stroke-width: 2;
        }
        .log-filters .log-filter summary .filter-active-num {
            color: var(--log-filter-active-num-color);
            font-weight: bold;
            padding: 0 1px;
        }
        .log-filter .tab-navigation {
            position: relative;
        }
        .log-filter .tab-navigation input[type=\"radio\"] {
            position: absolute;
            pointer-events: none;
            opacity: 0;
        }
        .tab-navigation input[type=\"radio\"]:checked + .tab-control {
            background-color: var(--tab-active-background);
            border-radius: 6px;
            box-shadow: inset 0 0 0 1.5px var(--tab-active-border-color);
            color: var(--tab-active-color);
            position: relative;
            z-index: 1;
        }
        .theme-dark .tab-navigation input[type=\"radio\"]:checked + .tab-control {
            box-shadow: inset 0 0 0 1px var(--tab-border-color);
        }
        .tab-navigation input[type=\"radio\"]:focus-visible + .tab-control {
            outline: 1px solid var(--color-link);
        }
        .tab-navigation input[type=\"radio\"]:checked + .tab-control + input[type=\"radio\"] + .tab-control:before{
            width: 0;
        }

        .log-filters .log-filter .log-filter-content {
            background: var(--base-0);
            border: 1px solid var(--table-border-color);
            border-radius: 6px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            padding: 15px;
            position: absolute;
            left: 0;
            top: 32px;
            max-width: 400px;
            min-width: 200px;
            z-index: 9999;
        }
        .log-filters .log-filter .log-filter-content .log-filter-option {
            align-items: center;
            display: flex;
        }
        .log-filter .filter-select-all-or-none {
            margin-bottom: 10px;
        }
        .log-filter .filter-select-all-or-none button + button {
            margin-left: 15px;
        }
        .log-filters .log-filter .log-filter-content .log-filter-option + .log-filter-option {
            margin: 7px 0 0;
        }
        .log-filters .log-filter .log-filter-content .log-filter-option label {
            cursor: pointer;
            flex: 1;
            padding-left: 10px;
        }

        table.logs {
            border-bottom-width: 0;
            border-collapse: collapse;
        }
        table.logs tr + tr td {
            border-width: 1px 0 0;
        }
        table.logs .metadata {
            display: block;
            font-size: 12px;
        }
        .theme-dark tr.status-error td,
        .theme-dark tr.status-warning td { border-bottom: unset; border-top: unset; }

        table.logs .log-timestamp {
            color: var(--log-timestamp-color);
        }
        table.logs .log-metadata {
            margin: 8px 0 0;
        }
        table.logs .log-metadata > span {
            display: inline-block;
        }
        table.logs .log-metadata > span + span {
            margin-left: 10px;
        }
        table.logs .log-metadata .log-channel {
            color: var(--base-1);
            font-size: 13px;
            font-weight: bold;
        }
        table.logs .log-metadata .badge {
            background: var(--badge-light-background);
            color: var(--badge-light-color);
        }
        table.logs .log-metadata .log-num-occurrences {
            color: var(--color-muted);
            font-size: 13px;
        }
        table.logs .log-metadata .context {
            background: var(--code-block-background);
            border-radius: 4px;
            padding: 5px;
        }
        table.logs .log-metadata .context + .context {
            margin-top: 10px;
        }
        .log-type-badge {
            background: var(--badge-light-background);
            box-shadow: none;
            color: var(--badge-light-color);
            display: inline-block;
            font-family: var(--font-family-system);
            margin-top: 5px;
        }
        .log-type-badge.badge-deprecation,
        .log-type-badge.badge-warning {
            background: var(--badge-warning-background);
            color: var(--badge-warning-color);
        }
        .log-type-badge.badge-error {
            background: var(--badge-danger-background);
            color: var(--badge-danger-color);
        }
        .log-type-badge.badge-silenced {
            background: #EDE9FE;
            color: #6D28D9;
        }
        .theme-dark .log-type-badge.badge-silenced {
            background: #5B21B6;
            color: #EDE9FE;
        }

        tr.log-status-warning > td:first-child,
        tr.log-status-error > td:first-child,
        tr.log-status-silenced > td:first-child {
            position: relative;
        }
        tr.log-status-warning > td:first-child:before,
        tr.log-status-error > td:first-child:before,
        tr.log-status-silenced > td:first-child:before {
            background: transparent;
            border-radius: 0;
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
        }
        tr.log-status-warning > td:first-child:before {
            background: var(--yellow-400);
        }
        tr.log-status-error > td:first-child:before {
            background: var(--red-400);
        }
        tr.log-status-silenced > td:first-child:before {
            background: #a78bfa;
        }

        .container-compilation-logs {
            background: var(--table-background);
            border: 1px solid var(--base-2);
            border-radius: 6px;
            margin-top: 30px;
            padding: 15px;
        }
        .container-compilation-logs summary {
            cursor: pointer;
        }
        .container-compilation-logs summary h4 {
            margin: 0 0 5px;
        }
        .container-compilation-logs summary p {
            margin: 0;
        }
    </style>
";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 238
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_toolbar(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "toolbar"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "toolbar"));

        // line 239
        yield "    ";
        if (((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 239, $this->source); })()), "counterrors", [], "any", false, false, false, 239) || CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 239, $this->source); })()), "countdeprecations", [], "any", false, false, false, 239)) || CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 239, $this->source); })()), "countwarnings", [], "any", false, false, false, 239))) {
            // line 240
            yield "        ";
            $context["icon"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
                // line 241
                yield "            ";
                $context["status_color"] = ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 241, $this->source); })()), "counterrors", [], "any", false, false, false, 241)) ? ("red") : (((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 241, $this->source); })()), "countwarnings", [], "any", false, false, false, 241)) ? ("yellow") : ("none"))));
                // line 242
                yield "            ";
                yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/logger.svg");
                yield "
            <span class=\"sf-toolbar-value\">";
                // line 243
                yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 243, $this->source); })()), "counterrors", [], "any", false, false, false, 243)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 243, $this->source); })()), "counterrors", [], "any", false, false, false, 243), "html", null, true)) : ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 243, $this->source); })()), "countdeprecations", [], "any", false, false, false, 243) + CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 243, $this->source); })()), "countwarnings", [], "any", false, false, false, 243)), "html", null, true)));
                yield "</span>
        ";
                yield from [];
            })())) ? '' : new Markup($tmp, $this->env->getCharset());
            // line 245
            yield "
        ";
            // line 246
            $context["text"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
                // line 247
                yield "            <div class=\"sf-toolbar-info-piece\">
                <b>Errors</b>
                <span class=\"sf-toolbar-status sf-toolbar-status-";
                // line 249
                yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 249, $this->source); })()), "counterrors", [], "any", false, false, false, 249)) ? ("red") : (""));
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "counterrors", [], "any", true, true, false, 249)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "counterrors", [], "any", false, false, false, 249), 0)) : (0)), "html", null, true);
                yield "</span>
            </div>

            <div class=\"sf-toolbar-info-piece\">
                <b>Warnings</b>
                <span class=\"sf-toolbar-status sf-toolbar-status-";
                // line 254
                yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 254, $this->source); })()), "countwarnings", [], "any", false, false, false, 254)) ? ("yellow") : (""));
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "countwarnings", [], "any", true, true, false, 254)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "countwarnings", [], "any", false, false, false, 254), 0)) : (0)), "html", null, true);
                yield "</span>
            </div>

            <div class=\"sf-toolbar-info-piece\">
                <b>Deprecations</b>
                <span class=\"sf-toolbar-status sf-toolbar-status-";
                // line 259
                yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 259, $this->source); })()), "countdeprecations", [], "any", false, false, false, 259)) ? ("none") : (""));
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "countdeprecations", [], "any", true, true, false, 259)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "countdeprecations", [], "any", false, false, false, 259), 0)) : (0)), "html", null, true);
                yield "</span>
            </div>
        ";
                yield from [];
            })())) ? '' : new Markup($tmp, $this->env->getCharset());
            // line 262
            yield "
        ";
            // line 263
            yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/toolbar_item.html.twig", ["link" => (isset($context["profiler_url"]) || array_key_exists("profiler_url", $context) ? $context["profiler_url"] : (function () { throw new RuntimeError('Variable "profiler_url" does not exist.', 263, $this->source); })()), "status" => (isset($context["status_color"]) || array_key_exists("status_color", $context) ? $context["status_color"] : (function () { throw new RuntimeError('Variable "status_color" does not exist.', 263, $this->source); })())]);
            yield "
    ";
        }
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 267
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_menu(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "menu"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "menu"));

        // line 268
        yield "    <span class=\"label label-status-";
        yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 268, $this->source); })()), "counterrors", [], "any", false, false, false, 268)) ? ("error") : (((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 268, $this->source); })()), "countwarnings", [], "any", false, false, false, 268)) ? ("warning") : ("none"))));
        yield " ";
        yield ((Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 268, $this->source); })()), "logs", [], "any", false, false, false, 268))) ? ("disabled") : (""));
        yield "\">
        <span class=\"icon\">";
        // line 269
        yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/logger.svg");
        yield "</span>
        <strong>Logs</strong>
        ";
        // line 271
        if (((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 271, $this->source); })()), "counterrors", [], "any", false, false, false, 271) || CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 271, $this->source); })()), "countdeprecations", [], "any", false, false, false, 271)) || CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 271, $this->source); })()), "countwarnings", [], "any", false, false, false, 271))) {
            // line 272
            yield "            <span class=\"count\">
                <span>";
            // line 273
            yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 273, $this->source); })()), "counterrors", [], "any", false, false, false, 273)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 273, $this->source); })()), "counterrors", [], "any", false, false, false, 273), "html", null, true)) : ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 273, $this->source); })()), "countdeprecations", [], "any", false, false, false, 273) + CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 273, $this->source); })()), "countwarnings", [], "any", false, false, false, 273)), "html", null, true)));
            yield "</span>
            </span>
        ";
        }
        // line 276
        yield "    </span>
";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 279
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_panel(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "panel"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "panel"));

        // line 280
        yield "    <h2>Log Messages</h2>

    ";
        // line 282
        if (Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 282, $this->source); })()), "processedLogs", [], "any", false, false, false, 282))) {
            // line 283
            yield "        <div class=\"empty empty-panel\">
            <p>No log messages available.</p>
        </div>
    ";
        } else {
            // line 287
            yield "        ";
            $context["has_error_logs"] = (Twig\Extension\CoreExtension::length($this->env->getCharset(), Twig\Extension\CoreExtension::filter($this->env, Twig\Extension\CoreExtension::column(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 287, $this->source); })()), "processedLogs", [], "any", false, false, false, 287), "type"), function ($__type__) use ($context, $macros) { $context["type"] = $__type__; return ("error" == (isset($context["type"]) || array_key_exists("type", $context) ? $context["type"] : (function () { throw new RuntimeError('Variable "type" does not exist.', 287, $this->source); })())); })) > 0);
            // line 288
            yield "        ";
            $context["has_deprecation_logs"] = (Twig\Extension\CoreExtension::length($this->env->getCharset(), Twig\Extension\CoreExtension::filter($this->env, Twig\Extension\CoreExtension::column(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 288, $this->source); })()), "processedLogs", [], "any", false, false, false, 288), "type"), function ($__type__) use ($context, $macros) { $context["type"] = $__type__; return ("deprecation" == (isset($context["type"]) || array_key_exists("type", $context) ? $context["type"] : (function () { throw new RuntimeError('Variable "type" does not exist.', 288, $this->source); })())); })) > 0);
            // line 289
            yield "
        ";
            // line 290
            $context["filters"] = CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 290, $this->source); })()), "filters", [], "any", false, false, false, 290);
            // line 291
            yield "        <div class=\"log-filters\">
            <div id=\"log-filter-type\" class=\"log-filter\">
                <div class=\"tab-navigation\">
                    ";
            // line 294
            $context["initially_active_tab"] = (((isset($context["has_error_logs"]) || array_key_exists("has_error_logs", $context) ? $context["has_error_logs"] : (function () { throw new RuntimeError('Variable "has_error_logs" does not exist.', 294, $this->source); })())) ? ("error") : ((((isset($context["has_deprecation_logs"]) || array_key_exists("has_deprecation_logs", $context) ? $context["has_deprecation_logs"] : (function () { throw new RuntimeError('Variable "has_deprecation_logs" does not exist.', 294, $this->source); })())) ? ("deprecation") : ("all"))));
            // line 295
            yield "                    <input type=\"radio\" id=\"filter-log-type-all\" name=\"filter-log-type\" value=\"all\" ";
            yield ((("all" == (isset($context["initially_active_tab"]) || array_key_exists("initially_active_tab", $context) ? $context["initially_active_tab"] : (function () { throw new RuntimeError('Variable "initially_active_tab" does not exist.', 295, $this->source); })()))) ? ("checked") : (""));
            yield ">
                    <label for=\"filter-log-type-all\" class=\"tab-control\">
                        All messages
                    </label>

                    <input type=\"radio\" id=\"filter-log-type-error\" name=\"filter-log-type\" value=\"error\" ";
            // line 300
            yield ((("error" == (isset($context["initially_active_tab"]) || array_key_exists("initially_active_tab", $context) ? $context["initially_active_tab"] : (function () { throw new RuntimeError('Variable "initially_active_tab" does not exist.', 300, $this->source); })()))) ? ("checked") : (""));
            yield ">
                    <label for=\"filter-log-type-error\" class=\"tab-control\">
                        Errors
                        <span class=\"badge status-";
            // line 303
            yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 303, $this->source); })()), "counterrors", [], "any", false, false, false, 303)) ? ("error") : (""));
            yield "\">";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "counterrors", [], "any", true, true, false, 303)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "counterrors", [], "any", false, false, false, 303), 0)) : (0)), "html", null, true);
            yield "</span>
                    </label>

                    <input type=\"radio\" id=\"filter-log-type-deprecation\" name=\"filter-log-type\" value=\"deprecation\" ";
            // line 306
            yield ((("deprecation" == (isset($context["initially_active_tab"]) || array_key_exists("initially_active_tab", $context) ? $context["initially_active_tab"] : (function () { throw new RuntimeError('Variable "initially_active_tab" does not exist.', 306, $this->source); })()))) ? ("checked") : (""));
            yield ">
                    <label for=\"filter-log-type-deprecation\" class=\"tab-control\">
                        Deprecations
                        <span class=\"badge status-";
            // line 309
            yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 309, $this->source); })()), "countdeprecations", [], "any", false, false, false, 309)) ? ("warning") : (""));
            yield "\">";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "countdeprecations", [], "any", true, true, false, 309)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "countdeprecations", [], "any", false, false, false, 309), 0)) : (0)), "html", null, true);
            yield "</span>
                    </label>
                </div>
            </div>

            <details id=\"log-filter-priority\" class=\"log-filter\">
                <summary>
                    <span class=\"icon\">";
            // line 316
            yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/filter.svg");
            yield "</span>
                    Level (<span class=\"filter-active-num\">";
            // line 317
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((Twig\Extension\CoreExtension::length($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["filters"]) || array_key_exists("filters", $context) ? $context["filters"] : (function () { throw new RuntimeError('Variable "filters" does not exist.', 317, $this->source); })()), "priority", [], "any", false, false, false, 317)) - 1), "html", null, true);
            yield "</span>)
                </summary>

                <div class=\"log-filter-content\">
                    <div class=\"filter-select-all-or-none\">
                        <button type=\"button\" class=\"btn btn-link select-all\">Select All</button>
                        <button type=\"button\" class=\"btn btn-link select-none\">Select None</button>
                    </div>

                    ";
            // line 326
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["filters"]) || array_key_exists("filters", $context) ? $context["filters"] : (function () { throw new RuntimeError('Variable "filters" does not exist.', 326, $this->source); })()), "priority", [], "any", false, false, false, 326));
            foreach ($context['_seq'] as $context["label"] => $context["value"]) {
                // line 327
                yield "                        <div class=\"log-filter-option\">
                            <input ";
                // line 328
                yield ((("debug" != $context["value"])) ? ("checked") : (""));
                yield " type=\"checkbox\" id=\"filter-log-level-";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\" name=\"filter-log-level-";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\" value=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\">
                            <label for=\"filter-log-level-";
                // line 329
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["label"], "html", null, true);
                yield "</label>
                        </div>
                    ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['label'], $context['value'], $context['_parent']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 332
            yield "                </div>
            </details>

            <details id=\"log-filter-channel\" class=\"log-filter\">
                <summary>
                    <span class=\"icon\">";
            // line 337
            yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/filter.svg");
            yield "</span>
                    Channel (<span class=\"filter-active-num\">";
            // line 338
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((Twig\Extension\CoreExtension::length($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["filters"]) || array_key_exists("filters", $context) ? $context["filters"] : (function () { throw new RuntimeError('Variable "filters" does not exist.', 338, $this->source); })()), "channel", [], "any", false, false, false, 338)) - 1), "html", null, true);
            yield "</span>)
                </summary>

                <div class=\"log-filter-content\">
                    <div class=\"filter-select-all-or-none\">
                        <button type=\"button\" class=\"btn btn-link select-all\">Select All</button>
                        <button type=\"button\" class=\"btn btn-link select-none\">Select None</button>
                    </div>

                    ";
            // line 347
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["filters"]) || array_key_exists("filters", $context) ? $context["filters"] : (function () { throw new RuntimeError('Variable "filters" does not exist.', 347, $this->source); })()), "channel", [], "any", false, false, false, 347));
            foreach ($context['_seq'] as $context["_key"] => $context["value"]) {
                // line 348
                yield "                        <div class=\"log-filter-option\">
                            <input ";
                // line 349
                yield ((("event" != $context["value"])) ? ("checked") : (""));
                yield " type=\"checkbox\" id=\"filter-log-channel-";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\" name=\"filter-log-channel-";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\" value=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\">
                            <label for=\"filter-log-channel-";
                // line 350
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["value"], "html", null, true);
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::titleCase($this->env->getCharset(), $context["value"]), "html", null, true);
                yield "</label>
                        </div>
                    ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_key'], $context['value'], $context['_parent']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 353
            yield "                </div>
            </details>
        </div>

        <table class=\"logs\">
            <colgroup>
                <col style=\"width: 140px\">
                <col>
            </colgroup>

            <thead>
                <tr>
                    <th>Time</th>
                    <th>Message</th>
                </tr>
            </thead>

            <tbody>
                ";
            // line 371
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 371, $this->source); })()), "processedLogs", [], "any", false, false, false, 371));
            $context['loop'] = [
              'parent' => $context['_parent'],
              'index0' => 0,
              'index'  => 1,
              'first'  => true,
            ];
            if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
                $length = count($context['_seq']);
                $context['loop']['revindex0'] = $length - 1;
                $context['loop']['revindex'] = $length;
                $context['loop']['length'] = $length;
                $context['loop']['last'] = 1 === $length;
            }
            foreach ($context['_seq'] as $context["_key"] => $context["log"]) {
                // line 372
                yield "                    ";
                $context["css_class"] = ((("error" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "type", [], "any", false, false, false, 372))) ? ("error") : (((((CoreExtension::getAttribute($this->env, $this->source,                 // line 373
$context["log"], "priorityName", [], "any", false, false, false, 373) == "WARNING") || ("deprecation" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "type", [], "any", false, false, false, 373)))) ? ("warning") : (((("silenced" == CoreExtension::getAttribute($this->env, $this->source,                 // line 374
$context["log"], "type", [], "any", false, false, false, 374))) ? ("silenced") : (""))))));
                // line 376
                yield "                    <tr class=\"log-status-";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["css_class"]) || array_key_exists("css_class", $context) ? $context["css_class"] : (function () { throw new RuntimeError('Variable "css_class" does not exist.', 376, $this->source); })()), "html", null, true);
                yield "\" data-type=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "type", [], "any", false, false, false, 376), "html", null, true);
                yield "\" data-priority=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "priority", [], "any", false, false, false, 376), "html", null, true);
                yield "\" data-channel=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "channel", [], "any", false, false, false, 376), "html", null, true);
                yield "\" style=\"";
                yield (((("event" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "channel", [], "any", false, false, false, 376)) || ("DEBUG" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "priorityName", [], "any", false, false, false, 376)))) ? ("display: none") : (""));
                yield "\">
                        <td class=\"log-timestamp\">
                            <time class=\"newline\" title=\"";
                // line 378
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Twig\Extension\CoreExtension']->formatDate(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "timestamp", [], "any", false, false, false, 378), "r"), "html", null, true);
                yield "\" datetime=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Twig\Extension\CoreExtension']->formatDate(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "timestamp", [], "any", false, false, false, 378), Twig\Extension\CoreExtension::constant("DateTime::RFC3339_EXTENDED")), "html", null, true);
                yield "\" data-convert-to-user-timezone data-render-as-time data-render-with-millisecond-precision>
                                ";
                // line 379
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Twig\Extension\CoreExtension']->formatDate(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "timestamp", [], "any", false, false, false, 379), "H:i:s.v"), "html", null, true);
                yield "
                            </time>

                            ";
                // line 382
                if ((CoreExtension::inFilter(CoreExtension::getAttribute($this->env, $this->source, $context["log"], "type", [], "any", false, false, false, 382), ["error", "deprecation", "silenced"]) || ("WARNING" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "priorityName", [], "any", false, false, false, 382)))) {
                    // line 383
                    yield "                                <span class=\"log-type-badge badge badge-";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["css_class"]) || array_key_exists("css_class", $context) ? $context["css_class"] : (function () { throw new RuntimeError('Variable "css_class" does not exist.', 383, $this->source); })()), "html", null, true);
                    yield "\">
                                    ";
                    // line 384
                    if ((("error" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "type", [], "any", false, false, false, 384)) || ("WARNING" == CoreExtension::getAttribute($this->env, $this->source, $context["log"], "priorityName", [], "any", false, false, false, 384)))) {
                        // line 385
                        yield "                                        ";
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::lower($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["log"], "priorityName", [], "any", false, false, false, 385)), "html", null, true);
                        yield "
                                    ";
                    } else {
                        // line 387
                        yield "                                        ";
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::lower($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["log"], "type", [], "any", false, false, false, 387)), "html", null, true);
                        yield "
                                    ";
                    }
                    // line 389
                    yield "                                </span>
                            ";
                } else {
                    // line 391
                    yield "                                <span class=\"log-type-badge badge badge-";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["css_class"]) || array_key_exists("css_class", $context) ? $context["css_class"] : (function () { throw new RuntimeError('Variable "css_class" does not exist.', 391, $this->source); })()), "html", null, true);
                    yield "\">
                                    ";
                    // line 392
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::lower($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["log"], "priorityName", [], "any", false, false, false, 392)), "html", null, true);
                    yield "
                                </span>
                            ";
                }
                // line 395
                yield "                        </td>

                        <td class=\"font-normal\">
                            ";
                // line 398
                yield $this->getTemplateForMacro("macro_render_log_message", $context, 398, $this->getSourceContext())->macro_render_log_message(...["debug", CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "index", [], "any", false, false, false, 398), $context["log"]]);
                yield "
                        </td>
                    </tr>
                ";
                ++$context['loop']['index0'];
                ++$context['loop']['index'];
                $context['loop']['first'] = false;
                if (isset($context['loop']['revindex0'], $context['loop']['revindex'])) {
                    --$context['loop']['revindex0'];
                    --$context['loop']['revindex'];
                    $context['loop']['last'] = 0 === $context['loop']['revindex0'];
                }
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_key'], $context['log'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 402
            yield "            </tbody>
        </table>

        <div class=\"no-logs-message empty\">
            <p>There are no log messages.</p>
        </div>

        <script>Sfjs.initializeLogsTable();</script>
    ";
        }
        // line 411
        yield "
    ";
        // line 412
        $context["compilerLogTotal"] = Twig\Extension\CoreExtension::reduce($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 412, $this->source); })()), "compilerLogs", [], "any", false, false, false, 412), function ($__total__, $__logs__) use ($context, $macros) { $context["total"] = $__total__; $context["logs"] = $__logs__; return ((isset($context["total"]) || array_key_exists("total", $context) ? $context["total"] : (function () { throw new RuntimeError('Variable "total" does not exist.', 412, $this->source); })()) + Twig\Extension\CoreExtension::length($this->env->getCharset(), (isset($context["logs"]) || array_key_exists("logs", $context) ? $context["logs"] : (function () { throw new RuntimeError('Variable "logs" does not exist.', 412, $this->source); })()))); }, 0);
        // line 413
        yield "    <details class=\"container-compilation-logs\">
        <summary>
            <h4>Container Compilation Logs <span class=\"text-muted\">(";
        // line 415
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["compilerLogTotal"]) || array_key_exists("compilerLogTotal", $context) ? $context["compilerLogTotal"] : (function () { throw new RuntimeError('Variable "compilerLogTotal" does not exist.', 415, $this->source); })()), "html", null, true);
        yield ")</span></h4>
            <span class=\"text-muted\">Log messages generated during the compilation of the service container.</span>
        </summary>

        ";
        // line 419
        if (Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 419, $this->source); })()), "compilerLogs", [], "any", false, false, false, 419))) {
            // line 420
            yield "            <div class=\"empty\">
                <p>There are no compiler log messages.</p>
            </div>
        ";
        } else {
            // line 424
            yield "            <table class=\"container-logs\">
                <thead>
                <tr>
                    <th>Messages</th>
                    <th class=\"full-width\">Class</th>
                </tr>
                </thead>

                <tbody>
                ";
            // line 433
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 433, $this->source); })()), "compilerLogs", [], "any", false, false, false, 433));
            $context['loop'] = [
              'parent' => $context['_parent'],
              'index0' => 0,
              'index'  => 1,
              'first'  => true,
            ];
            if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
                $length = count($context['_seq']);
                $context['loop']['revindex0'] = $length - 1;
                $context['loop']['revindex'] = $length;
                $context['loop']['length'] = $length;
                $context['loop']['last'] = 1 === $length;
            }
            foreach ($context['_seq'] as $context["class"] => $context["logs"]) {
                // line 434
                yield "                    <tr>
                        <td class=\"font-normal text-right\">";
                // line 435
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::length($this->env->getCharset(), $context["logs"]), "html", null, true);
                yield "</td>
                        <td class=\"font-normal\">
                            ";
                // line 437
                $context["context_id"] = ("context-compiler-" . CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "index", [], "any", false, false, false, 437));
                // line 438
                yield "
                            <button type=\"button\" class=\"btn btn-link sf-toggle\" data-toggle-selector=\"#";
                // line 439
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["context_id"]) || array_key_exists("context_id", $context) ? $context["context_id"] : (function () { throw new RuntimeError('Variable "context_id" does not exist.', 439, $this->source); })()), "html", null, true);
                yield "\" data-toggle-alt-content=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["class"], "html", null, true);
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["class"], "html", null, true);
                yield "</button>

                            <div id=\"";
                // line 441
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["context_id"]) || array_key_exists("context_id", $context) ? $context["context_id"] : (function () { throw new RuntimeError('Variable "context_id" does not exist.', 441, $this->source); })()), "html", null, true);
                yield "\" class=\"context sf-toggle-content sf-toggle-hidden\">
                                <ul class=\"break-long-words\">
                                    ";
                // line 443
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable($context["logs"]);
                foreach ($context['_seq'] as $context["_key"] => $context["log"]) {
                    // line 444
                    yield "                                        <li>";
                    yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpLog($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["log"], "message", [], "any", false, false, false, 444));
                    yield "</li>
                                    ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_key'], $context['log'], $context['_parent']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 446
                yield "                                </ul>
                            </div>
                        </td>
                    </tr>
                ";
                ++$context['loop']['index0'];
                ++$context['loop']['index'];
                $context['loop']['first'] = false;
                if (isset($context['loop']['revindex0'], $context['loop']['revindex'])) {
                    --$context['loop']['revindex0'];
                    --$context['loop']['revindex'];
                    $context['loop']['last'] = 0 === $context['loop']['revindex0'];
                }
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['class'], $context['logs'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 451
            yield "                </tbody>
            </table>
        ";
        }
        // line 454
        yield "    </details>
";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 457
    public function macro_render_log_message($category = null, $log_index = null, $log = null, ...$varargs): string|Markup
    {
        $macros = $this->macros;
        $context = [
            "category" => $category,
            "log_index" => $log_index,
            "log" => $log,
            "varargs" => $varargs,
        ] + $this->env->getGlobals();

        $blocks = [];

        return ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
            $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
            $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "macro", "render_log_message"));

            $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
            $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "macro", "render_log_message"));

            // line 458
            yield "    ";
            $context["has_context"] = (CoreExtension::getAttribute($this->env, $this->source, ($context["log"] ?? null), "context", [], "any", true, true, false, 458) &&  !Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 458, $this->source); })()), "context", [], "any", false, false, false, 458)));
            // line 459
            yield "    ";
            $context["has_trace"] = CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, ($context["log"] ?? null), "context", [], "any", false, true, false, 459), "exception", [], "any", false, true, false, 459), "trace", [], "any", true, true, false, 459);
            // line 460
            yield "
    ";
            // line 461
            if ( !(isset($context["has_context"]) || array_key_exists("has_context", $context) ? $context["has_context"] : (function () { throw new RuntimeError('Variable "has_context" does not exist.', 461, $this->source); })())) {
                // line 462
                yield "        ";
                yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpLog($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 462, $this->source); })()), "message", [], "any", false, false, false, 462));
                yield "
    ";
            } else {
                // line 464
                yield "        ";
                yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpLog($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 464, $this->source); })()), "message", [], "any", false, false, false, 464), CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 464, $this->source); })()), "context", [], "any", false, false, false, 464));
                yield "
    ";
            }
            // line 466
            yield "
    <div class=\"log-metadata\">
        ";
            // line 468
            if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 468, $this->source); })()), "channel", [], "any", false, false, false, 468)) {
                // line 469
                yield "            <span class=\"badge\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 469, $this->source); })()), "channel", [], "any", false, false, false, 469), "html", null, true);
                yield "</span>
        ";
            }
            // line 471
            yield "
        ";
            // line 472
            if ((CoreExtension::getAttribute($this->env, $this->source, ($context["log"] ?? null), "errorCount", [], "any", true, true, false, 472) && (CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 472, $this->source); })()), "errorCount", [], "any", false, false, false, 472) > 1))) {
                // line 473
                yield "            <span class=\"log-num-occurrences\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 473, $this->source); })()), "errorCount", [], "any", false, false, false, 473), "html", null, true);
                yield " times</span>
        ";
            }
            // line 475
            yield "
        ";
            // line 476
            if ((isset($context["has_context"]) || array_key_exists("has_context", $context) ? $context["has_context"] : (function () { throw new RuntimeError('Variable "has_context" does not exist.', 476, $this->source); })())) {
                // line 477
                yield "            ";
                $context["context_id"] = ((("context-" . (isset($context["category"]) || array_key_exists("category", $context) ? $context["category"] : (function () { throw new RuntimeError('Variable "category" does not exist.', 477, $this->source); })())) . "-") . (isset($context["log_index"]) || array_key_exists("log_index", $context) ? $context["log_index"] : (function () { throw new RuntimeError('Variable "log_index" does not exist.', 477, $this->source); })()));
                // line 478
                yield "            <span><button type=\"button\" class=\"btn btn-link text-small sf-toggle\" data-toggle-selector=\"#";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["context_id"]) || array_key_exists("context_id", $context) ? $context["context_id"] : (function () { throw new RuntimeError('Variable "context_id" does not exist.', 478, $this->source); })()), "html", null, true);
                yield "\" data-toggle-alt-content=\"Hide context\">Show context</button></span>
        ";
            }
            // line 480
            yield "
        ";
            // line 481
            if ((isset($context["has_trace"]) || array_key_exists("has_trace", $context) ? $context["has_trace"] : (function () { throw new RuntimeError('Variable "has_trace" does not exist.', 481, $this->source); })())) {
                // line 482
                yield "            ";
                $context["trace_id"] = ((("trace-" . (isset($context["category"]) || array_key_exists("category", $context) ? $context["category"] : (function () { throw new RuntimeError('Variable "category" does not exist.', 482, $this->source); })())) . "-") . (isset($context["log_index"]) || array_key_exists("log_index", $context) ? $context["log_index"] : (function () { throw new RuntimeError('Variable "log_index" does not exist.', 482, $this->source); })()));
                // line 483
                yield "            <span><button type=\"button\" class=\"btn btn-link text-small sf-toggle\" data-toggle-selector=\"#";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["trace_id"]) || array_key_exists("trace_id", $context) ? $context["trace_id"] : (function () { throw new RuntimeError('Variable "trace_id" does not exist.', 483, $this->source); })()), "html", null, true);
                yield "\" data-toggle-alt-content=\"Hide trace\">Show trace</button></span>
        ";
            }
            // line 485
            yield "
        ";
            // line 486
            if ((isset($context["has_context"]) || array_key_exists("has_context", $context) ? $context["has_context"] : (function () { throw new RuntimeError('Variable "has_context" does not exist.', 486, $this->source); })())) {
                // line 487
                yield "            <div id=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["context_id"]) || array_key_exists("context_id", $context) ? $context["context_id"] : (function () { throw new RuntimeError('Variable "context_id" does not exist.', 487, $this->source); })()), "html", null, true);
                yield "\" class=\"context sf-toggle-content sf-toggle-hidden\">
                ";
                // line 488
                yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 488, $this->source); })()), "context", [], "any", false, false, false, 488), 1);
                yield "
            </div>
        ";
            }
            // line 491
            yield "
        ";
            // line 492
            if ((isset($context["has_trace"]) || array_key_exists("has_trace", $context) ? $context["has_trace"] : (function () { throw new RuntimeError('Variable "has_trace" does not exist.', 492, $this->source); })())) {
                // line 493
                yield "            <div id=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["trace_id"]) || array_key_exists("trace_id", $context) ? $context["trace_id"] : (function () { throw new RuntimeError('Variable "trace_id" does not exist.', 493, $this->source); })()), "html", null, true);
                yield "\" class=\"context sf-toggle-content sf-toggle-hidden\">
                ";
                // line 494
                yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["log"]) || array_key_exists("log", $context) ? $context["log"] : (function () { throw new RuntimeError('Variable "log" does not exist.', 494, $this->source); })()), "context", [], "any", false, false, false, 494), "exception", [], "any", false, false, false, 494), "trace", [], "any", false, false, false, 494), 1);
                yield "
            </div>
        ";
            }
            // line 497
            yield "    </div>
";
            
            $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

            
            $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

            yield from [];
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName(): string
    {
        return "@WebProfiler/Collector/logger.html.twig";
    }

    /**
     * @codeCoverageIgnore
     */
    public function isTraitable(): bool
    {
        return false;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo(): array
    {
        return array (  1030 => 497,  1024 => 494,  1019 => 493,  1017 => 492,  1014 => 491,  1008 => 488,  1003 => 487,  1001 => 486,  998 => 485,  992 => 483,  989 => 482,  987 => 481,  984 => 480,  978 => 478,  975 => 477,  973 => 476,  970 => 475,  964 => 473,  962 => 472,  959 => 471,  953 => 469,  951 => 468,  947 => 466,  941 => 464,  935 => 462,  933 => 461,  930 => 460,  927 => 459,  924 => 458,  904 => 457,  892 => 454,  887 => 451,  869 => 446,  860 => 444,  856 => 443,  851 => 441,  842 => 439,  839 => 438,  837 => 437,  832 => 435,  829 => 434,  812 => 433,  801 => 424,  795 => 420,  793 => 419,  786 => 415,  782 => 413,  780 => 412,  777 => 411,  766 => 402,  748 => 398,  743 => 395,  737 => 392,  732 => 391,  728 => 389,  722 => 387,  716 => 385,  714 => 384,  709 => 383,  707 => 382,  701 => 379,  695 => 378,  681 => 376,  679 => 374,  678 => 373,  676 => 372,  659 => 371,  639 => 353,  628 => 350,  618 => 349,  615 => 348,  611 => 347,  599 => 338,  595 => 337,  588 => 332,  577 => 329,  567 => 328,  564 => 327,  560 => 326,  548 => 317,  544 => 316,  532 => 309,  526 => 306,  518 => 303,  512 => 300,  503 => 295,  501 => 294,  496 => 291,  494 => 290,  491 => 289,  488 => 288,  485 => 287,  479 => 283,  477 => 282,  473 => 280,  460 => 279,  448 => 276,  442 => 273,  439 => 272,  437 => 271,  432 => 269,  425 => 268,  412 => 267,  398 => 263,  395 => 262,  386 => 259,  376 => 254,  366 => 249,  362 => 247,  360 => 246,  357 => 245,  351 => 243,  346 => 242,  343 => 241,  340 => 240,  337 => 239,  324 => 238,  79 => 4,  66 => 3,  43 => 1,);
    }

    public function getSourceContext(): Source
    {
        return new Source("{% extends '@WebProfiler/Profiler/layout.html.twig' %}

{% block head %}
    {{ parent() }}

    <style>
        :root {
            --log-filter-active-num-color: #2563EB;
            --log-timestamp-color: #555;
        }
        .theme-dark {
            --log-filter-active-num-color: #2563EB;
            --log-timestamp-color: #ccc;
        }

        .log-filters {
            display: flex;
            flex-wrap: wrap;
        }
        .log-filters .log-filter {
            flex-shrink: 0;
            margin-right: 15px;
            position: relative;
        }
        .log-filters .log-filter summary {
            align-items: center;
            background: var(--button-background);
            border-radius: 6px;
            border: 1px solid var(--button-border-color);
            box-shadow: var(--button-box-shadow);
            color: var(--button-color);
            cursor: pointer;
            display: flex;
            font-size: 13px;
            font-weight: 500;
            padding: 4px 8px;
            white-space: nowrap;
        }
        .log-filters .log-filter summary:active {
            box-shadow: none;
            transform: translateY(1px);
        }
        .log-filters .log-filter summary .icon {
            height: 18px;
            width: 18px;
            margin: 0 7px 0 0;
        }
        .log-filters .log-filter summary svg {
            height: 18px;
            width: 18px;
            opacity: 0.7;
        }
        .log-filters .log-filter summary svg {
            stroke-width: 2;
        }
        .log-filters .log-filter summary .filter-active-num {
            color: var(--log-filter-active-num-color);
            font-weight: bold;
            padding: 0 1px;
        }
        .log-filter .tab-navigation {
            position: relative;
        }
        .log-filter .tab-navigation input[type=\"radio\"] {
            position: absolute;
            pointer-events: none;
            opacity: 0;
        }
        .tab-navigation input[type=\"radio\"]:checked + .tab-control {
            background-color: var(--tab-active-background);
            border-radius: 6px;
            box-shadow: inset 0 0 0 1.5px var(--tab-active-border-color);
            color: var(--tab-active-color);
            position: relative;
            z-index: 1;
        }
        .theme-dark .tab-navigation input[type=\"radio\"]:checked + .tab-control {
            box-shadow: inset 0 0 0 1px var(--tab-border-color);
        }
        .tab-navigation input[type=\"radio\"]:focus-visible + .tab-control {
            outline: 1px solid var(--color-link);
        }
        .tab-navigation input[type=\"radio\"]:checked + .tab-control + input[type=\"radio\"] + .tab-control:before{
            width: 0;
        }

        .log-filters .log-filter .log-filter-content {
            background: var(--base-0);
            border: 1px solid var(--table-border-color);
            border-radius: 6px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            padding: 15px;
            position: absolute;
            left: 0;
            top: 32px;
            max-width: 400px;
            min-width: 200px;
            z-index: 9999;
        }
        .log-filters .log-filter .log-filter-content .log-filter-option {
            align-items: center;
            display: flex;
        }
        .log-filter .filter-select-all-or-none {
            margin-bottom: 10px;
        }
        .log-filter .filter-select-all-or-none button + button {
            margin-left: 15px;
        }
        .log-filters .log-filter .log-filter-content .log-filter-option + .log-filter-option {
            margin: 7px 0 0;
        }
        .log-filters .log-filter .log-filter-content .log-filter-option label {
            cursor: pointer;
            flex: 1;
            padding-left: 10px;
        }

        table.logs {
            border-bottom-width: 0;
            border-collapse: collapse;
        }
        table.logs tr + tr td {
            border-width: 1px 0 0;
        }
        table.logs .metadata {
            display: block;
            font-size: 12px;
        }
        .theme-dark tr.status-error td,
        .theme-dark tr.status-warning td { border-bottom: unset; border-top: unset; }

        table.logs .log-timestamp {
            color: var(--log-timestamp-color);
        }
        table.logs .log-metadata {
            margin: 8px 0 0;
        }
        table.logs .log-metadata > span {
            display: inline-block;
        }
        table.logs .log-metadata > span + span {
            margin-left: 10px;
        }
        table.logs .log-metadata .log-channel {
            color: var(--base-1);
            font-size: 13px;
            font-weight: bold;
        }
        table.logs .log-metadata .badge {
            background: var(--badge-light-background);
            color: var(--badge-light-color);
        }
        table.logs .log-metadata .log-num-occurrences {
            color: var(--color-muted);
            font-size: 13px;
        }
        table.logs .log-metadata .context {
            background: var(--code-block-background);
            border-radius: 4px;
            padding: 5px;
        }
        table.logs .log-metadata .context + .context {
            margin-top: 10px;
        }
        .log-type-badge {
            background: var(--badge-light-background);
            box-shadow: none;
            color: var(--badge-light-color);
            display: inline-block;
            font-family: var(--font-family-system);
            margin-top: 5px;
        }
        .log-type-badge.badge-deprecation,
        .log-type-badge.badge-warning {
            background: var(--badge-warning-background);
            color: var(--badge-warning-color);
        }
        .log-type-badge.badge-error {
            background: var(--badge-danger-background);
            color: var(--badge-danger-color);
        }
        .log-type-badge.badge-silenced {
            background: #EDE9FE;
            color: #6D28D9;
        }
        .theme-dark .log-type-badge.badge-silenced {
            background: #5B21B6;
            color: #EDE9FE;
        }

        tr.log-status-warning > td:first-child,
        tr.log-status-error > td:first-child,
        tr.log-status-silenced > td:first-child {
            position: relative;
        }
        tr.log-status-warning > td:first-child:before,
        tr.log-status-error > td:first-child:before,
        tr.log-status-silenced > td:first-child:before {
            background: transparent;
            border-radius: 0;
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
        }
        tr.log-status-warning > td:first-child:before {
            background: var(--yellow-400);
        }
        tr.log-status-error > td:first-child:before {
            background: var(--red-400);
        }
        tr.log-status-silenced > td:first-child:before {
            background: #a78bfa;
        }

        .container-compilation-logs {
            background: var(--table-background);
            border: 1px solid var(--base-2);
            border-radius: 6px;
            margin-top: 30px;
            padding: 15px;
        }
        .container-compilation-logs summary {
            cursor: pointer;
        }
        .container-compilation-logs summary h4 {
            margin: 0 0 5px;
        }
        .container-compilation-logs summary p {
            margin: 0;
        }
    </style>
{% endblock %}

{% block toolbar %}
    {% if collector.counterrors or collector.countdeprecations or collector.countwarnings %}
        {% set icon %}
            {% set status_color = collector.counterrors ? 'red' : collector.countwarnings ? 'yellow' : 'none' %}
            {{ source('@WebProfiler/Icon/logger.svg') }}
            <span class=\"sf-toolbar-value\">{{ collector.counterrors ?: (collector.countdeprecations + collector.countwarnings) }}</span>
        {% endset %}

        {% set text %}
            <div class=\"sf-toolbar-info-piece\">
                <b>Errors</b>
                <span class=\"sf-toolbar-status sf-toolbar-status-{{ collector.counterrors ? 'red' }}\">{{ collector.counterrors|default(0) }}</span>
            </div>

            <div class=\"sf-toolbar-info-piece\">
                <b>Warnings</b>
                <span class=\"sf-toolbar-status sf-toolbar-status-{{ collector.countwarnings ? 'yellow' }}\">{{ collector.countwarnings|default(0) }}</span>
            </div>

            <div class=\"sf-toolbar-info-piece\">
                <b>Deprecations</b>
                <span class=\"sf-toolbar-status sf-toolbar-status-{{ collector.countdeprecations ? 'none' }}\">{{ collector.countdeprecations|default(0) }}</span>
            </div>
        {% endset %}

        {{ include('@WebProfiler/Profiler/toolbar_item.html.twig', { link: profiler_url, status: status_color }) }}
    {% endif %}
{% endblock %}

{% block menu %}
    <span class=\"label label-status-{{ collector.counterrors ? 'error' : collector.countwarnings ? 'warning' : 'none' }} {{ collector.logs is empty ? 'disabled' }}\">
        <span class=\"icon\">{{ source('@WebProfiler/Icon/logger.svg') }}</span>
        <strong>Logs</strong>
        {% if collector.counterrors or collector.countdeprecations or collector.countwarnings %}
            <span class=\"count\">
                <span>{{ collector.counterrors ?: (collector.countdeprecations + collector.countwarnings) }}</span>
            </span>
        {% endif %}
    </span>
{% endblock %}

{% block panel %}
    <h2>Log Messages</h2>

    {% if collector.processedLogs is empty %}
        <div class=\"empty empty-panel\">
            <p>No log messages available.</p>
        </div>
    {% else %}
        {% set has_error_logs = collector.processedLogs|column('type')|filter(type => 'error' == type)|length > 0 %}
        {% set has_deprecation_logs = collector.processedLogs|column('type')|filter(type => 'deprecation' == type)|length > 0 %}

        {% set filters = collector.filters %}
        <div class=\"log-filters\">
            <div id=\"log-filter-type\" class=\"log-filter\">
                <div class=\"tab-navigation\">
                    {% set initially_active_tab = has_error_logs ? 'error' : has_deprecation_logs ? 'deprecation' : 'all' %}
                    <input type=\"radio\" id=\"filter-log-type-all\" name=\"filter-log-type\" value=\"all\" {{ 'all' == initially_active_tab ? 'checked' }}>
                    <label for=\"filter-log-type-all\" class=\"tab-control\">
                        All messages
                    </label>

                    <input type=\"radio\" id=\"filter-log-type-error\" name=\"filter-log-type\" value=\"error\" {{ 'error' == initially_active_tab ? 'checked' }}>
                    <label for=\"filter-log-type-error\" class=\"tab-control\">
                        Errors
                        <span class=\"badge status-{{ collector.counterrors ? 'error' }}\">{{ collector.counterrors|default(0) }}</span>
                    </label>

                    <input type=\"radio\" id=\"filter-log-type-deprecation\" name=\"filter-log-type\" value=\"deprecation\" {{ 'deprecation' == initially_active_tab ? 'checked' }}>
                    <label for=\"filter-log-type-deprecation\" class=\"tab-control\">
                        Deprecations
                        <span class=\"badge status-{{ collector.countdeprecations ? 'warning' }}\">{{ collector.countdeprecations|default(0) }}</span>
                    </label>
                </div>
            </div>

            <details id=\"log-filter-priority\" class=\"log-filter\">
                <summary>
                    <span class=\"icon\">{{ source('@WebProfiler/Icon/filter.svg') }}</span>
                    Level (<span class=\"filter-active-num\">{{ filters.priority|length - 1 }}</span>)
                </summary>

                <div class=\"log-filter-content\">
                    <div class=\"filter-select-all-or-none\">
                        <button type=\"button\" class=\"btn btn-link select-all\">Select All</button>
                        <button type=\"button\" class=\"btn btn-link select-none\">Select None</button>
                    </div>

                    {% for label, value in filters.priority %}
                        <div class=\"log-filter-option\">
                            <input {{ 'debug' != value ? 'checked' }} type=\"checkbox\" id=\"filter-log-level-{{ value }}\" name=\"filter-log-level-{{ value }}\" value=\"{{ value }}\">
                            <label for=\"filter-log-level-{{ value }}\">{{ label }}</label>
                        </div>
                    {% endfor %}
                </div>
            </details>

            <details id=\"log-filter-channel\" class=\"log-filter\">
                <summary>
                    <span class=\"icon\">{{ source('@WebProfiler/Icon/filter.svg') }}</span>
                    Channel (<span class=\"filter-active-num\">{{ filters.channel|length - 1 }}</span>)
                </summary>

                <div class=\"log-filter-content\">
                    <div class=\"filter-select-all-or-none\">
                        <button type=\"button\" class=\"btn btn-link select-all\">Select All</button>
                        <button type=\"button\" class=\"btn btn-link select-none\">Select None</button>
                    </div>

                    {% for value in filters.channel %}
                        <div class=\"log-filter-option\">
                            <input {{ 'event' != value ? 'checked' }} type=\"checkbox\" id=\"filter-log-channel-{{ value }}\" name=\"filter-log-channel-{{ value }}\" value=\"{{ value }}\">
                            <label for=\"filter-log-channel-{{ value }}\">{{ value|title }}</label>
                        </div>
                    {% endfor %}
                </div>
            </details>
        </div>

        <table class=\"logs\">
            <colgroup>
                <col style=\"width: 140px\">
                <col>
            </colgroup>

            <thead>
                <tr>
                    <th>Time</th>
                    <th>Message</th>
                </tr>
            </thead>

            <tbody>
                {% for log in collector.processedLogs %}
                    {% set css_class = 'error' == log.type ? 'error'
                        : (log.priorityName == 'WARNING' or 'deprecation' == log.type) ? 'warning'
                        : 'silenced' == log.type ? 'silenced'
                    %}
                    <tr class=\"log-status-{{ css_class }}\" data-type=\"{{ log.type }}\" data-priority=\"{{ log.priority }}\" data-channel=\"{{ log.channel }}\" style=\"{{ 'event' == log.channel or 'DEBUG' == log.priorityName ? 'display: none' }}\">
                        <td class=\"log-timestamp\">
                            <time class=\"newline\" title=\"{{ log.timestamp|date('r') }}\" datetime=\"{{ log.timestamp|date(constant('\\DateTime::RFC3339_EXTENDED')) }}\" data-convert-to-user-timezone data-render-as-time data-render-with-millisecond-precision>
                                {{ log.timestamp|date('H:i:s.v') }}
                            </time>

                            {% if log.type in ['error', 'deprecation', 'silenced'] or 'WARNING' == log.priorityName %}
                                <span class=\"log-type-badge badge badge-{{ css_class }}\">
                                    {% if 'error' == log.type or 'WARNING' == log.priorityName %}
                                        {{ log.priorityName|lower }}
                                    {% else %}
                                        {{ log.type|lower }}
                                    {% endif %}
                                </span>
                            {% else %}
                                <span class=\"log-type-badge badge badge-{{ css_class }}\">
                                    {{ log.priorityName|lower }}
                                </span>
                            {% endif %}
                        </td>

                        <td class=\"font-normal\">
                            {{ _self.render_log_message('debug', loop.index, log) }}
                        </td>
                    </tr>
                {% endfor %}
            </tbody>
        </table>

        <div class=\"no-logs-message empty\">
            <p>There are no log messages.</p>
        </div>

        <script>Sfjs.initializeLogsTable();</script>
    {% endif %}

    {% set compilerLogTotal = collector.compilerLogs|reduce((total, logs) => total + logs|length, 0) %}
    <details class=\"container-compilation-logs\">
        <summary>
            <h4>Container Compilation Logs <span class=\"text-muted\">({{ compilerLogTotal }})</span></h4>
            <span class=\"text-muted\">Log messages generated during the compilation of the service container.</span>
        </summary>

        {% if collector.compilerLogs is empty %}
            <div class=\"empty\">
                <p>There are no compiler log messages.</p>
            </div>
        {% else %}
            <table class=\"container-logs\">
                <thead>
                <tr>
                    <th>Messages</th>
                    <th class=\"full-width\">Class</th>
                </tr>
                </thead>

                <tbody>
                {% for class, logs in collector.compilerLogs %}
                    <tr>
                        <td class=\"font-normal text-right\">{{ logs|length }}</td>
                        <td class=\"font-normal\">
                            {% set context_id = 'context-compiler-' ~ loop.index %}

                            <button type=\"button\" class=\"btn btn-link sf-toggle\" data-toggle-selector=\"#{{ context_id }}\" data-toggle-alt-content=\"{{ class }}\">{{ class }}</button>

                            <div id=\"{{ context_id }}\" class=\"context sf-toggle-content sf-toggle-hidden\">
                                <ul class=\"break-long-words\">
                                    {% for log in logs %}
                                        <li>{{ profiler_dump_log(log.message) }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                        </td>
                    </tr>
                {% endfor %}
                </tbody>
            </table>
        {% endif %}
    </details>
{% endblock %}

{% macro render_log_message(category, log_index, log) %}
    {% set has_context = log.context is defined and log.context is not empty %}
    {% set has_trace = log.context.exception.trace is defined %}

    {% if not has_context %}
        {{ profiler_dump_log(log.message) }}
    {% else %}
        {{ profiler_dump_log(log.message, log.context) }}
    {% endif %}

    <div class=\"log-metadata\">
        {% if log.channel %}
            <span class=\"badge\">{{ log.channel }}</span>
        {% endif %}

        {% if log.errorCount is defined and log.errorCount > 1 %}
            <span class=\"log-num-occurrences\">{{ log.errorCount }} times</span>
        {% endif %}

        {% if has_context %}
            {% set context_id = 'context-' ~ category ~ '-' ~ log_index %}
            <span><button type=\"button\" class=\"btn btn-link text-small sf-toggle\" data-toggle-selector=\"#{{ context_id }}\" data-toggle-alt-content=\"Hide context\">Show context</button></span>
        {% endif %}

        {% if has_trace %}
            {% set trace_id = 'trace-' ~ category ~ '-' ~ log_index %}
            <span><button type=\"button\" class=\"btn btn-link text-small sf-toggle\" data-toggle-selector=\"#{{ trace_id }}\" data-toggle-alt-content=\"Hide trace\">Show trace</button></span>
        {% endif %}

        {% if has_context %}
            <div id=\"{{ context_id }}\" class=\"context sf-toggle-content sf-toggle-hidden\">
                {{ profiler_dump(log.context, maxDepth=1) }}
            </div>
        {% endif %}

        {% if has_trace %}
            <div id=\"{{ trace_id }}\" class=\"context sf-toggle-content sf-toggle-hidden\">
                {{ profiler_dump(log.context.exception.trace, maxDepth=1) }}
            </div>
        {% endif %}
    </div>
{% endmacro %}
", "@WebProfiler/Collector/logger.html.twig", "/src/vendor/symfony/web-profiler-bundle/Resources/views/Collector/logger.html.twig");
    }
}
