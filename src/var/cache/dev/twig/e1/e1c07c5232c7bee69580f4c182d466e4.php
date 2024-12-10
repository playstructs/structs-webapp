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

/* @WebProfiler/Profiler/toolbar_js.html.twig */
class __TwigTemplate_0c052f47b7643b9610607ebe3e8b17db extends Template
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

        $this->parent = false;

        $this->blocks = [
        ];
    }

    protected function doDisplay(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Profiler/toolbar_js.html.twig"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Profiler/toolbar_js.html.twig"));

        // line 1
        yield "<div id=\"sfwdt";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["token"]) || array_key_exists("token", $context) ? $context["token"] : (function () { throw new RuntimeError('Variable "token" does not exist.', 1, $this->source); })()), "html", null, true);
        yield "\" class=\"sf-toolbar sf-display-none\" role=\"region\" aria-label=\"Symfony Web Debug Toolbar\">
    ";
        // line 2
        yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/toolbar.html.twig", ["templates" => ["request" => "@WebProfiler/Profiler/cancel.html.twig"], "profile" => null, "profiler_url" => $this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getUrl("_profiler", ["token" =>         // line 7
(isset($context["token"]) || array_key_exists("token", $context) ? $context["token"] : (function () { throw new RuntimeError('Variable "token" does not exist.', 7, $this->source); })())]), "profiler_markup_version" => 3]);
        // line 9
        yield "
</div>

";
        // line 12
        yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/base_js.html.twig");
        yield "

<style";
        // line 14
        if ((isset($context["csp_style_nonce"]) || array_key_exists("csp_style_nonce", $context) ? $context["csp_style_nonce"] : (function () { throw new RuntimeError('Variable "csp_style_nonce" does not exist.', 14, $this->source); })())) {
            yield " nonce=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["csp_style_nonce"]) || array_key_exists("csp_style_nonce", $context) ? $context["csp_style_nonce"] : (function () { throw new RuntimeError('Variable "csp_style_nonce" does not exist.', 14, $this->source); })()), "html", null, true);
            yield "\"";
        }
        yield ">
    ";
        // line 15
        yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/toolbar.css.twig");
        yield "
</style>
<script";
        // line 17
        if ((isset($context["csp_script_nonce"]) || array_key_exists("csp_script_nonce", $context) ? $context["csp_script_nonce"] : (function () { throw new RuntimeError('Variable "csp_script_nonce" does not exist.', 17, $this->source); })())) {
            yield " nonce=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["csp_script_nonce"]) || array_key_exists("csp_script_nonce", $context) ? $context["csp_script_nonce"] : (function () { throw new RuntimeError('Variable "csp_script_nonce" does not exist.', 17, $this->source); })()), "html", null, true);
            yield "\"";
        }
        yield ">/*<![CDATA[*/
    (function () {
        Sfjs.loadToolbar('";
        // line 19
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["token"]) || array_key_exists("token", $context) ? $context["token"] : (function () { throw new RuntimeError('Variable "token" does not exist.', 19, $this->source); })()), "html", null, true);
        yield "');
    })();
/*]]>*/</script>
";
        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        yield from [];
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName(): string
    {
        return "@WebProfiler/Profiler/toolbar_js.html.twig";
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
        return array (  88 => 19,  79 => 17,  74 => 15,  66 => 14,  61 => 12,  56 => 9,  54 => 7,  53 => 2,  48 => 1,);
    }

    public function getSourceContext(): Source
    {
        return new Source("<div id=\"sfwdt{{ token }}\" class=\"sf-toolbar sf-display-none\" role=\"region\" aria-label=\"Symfony Web Debug Toolbar\">
    {{ include('@WebProfiler/Profiler/toolbar.html.twig', {
        templates: {
            'request': '@WebProfiler/Profiler/cancel.html.twig'
        },
        profile: null,
        profiler_url: url('_profiler', {token: token}),
        profiler_markup_version: 3,
    }) }}
</div>

{{ include('@WebProfiler/Profiler/base_js.html.twig') }}

<style{% if csp_style_nonce %} nonce=\"{{ csp_style_nonce }}\"{% endif %}>
    {{ include('@WebProfiler/Profiler/toolbar.css.twig') }}
</style>
<script{% if csp_script_nonce %} nonce=\"{{ csp_script_nonce }}\"{% endif %}>/*<![CDATA[*/
    (function () {
        Sfjs.loadToolbar('{{ token }}');
    })();
/*]]>*/</script>
", "@WebProfiler/Profiler/toolbar_js.html.twig", "/src/vendor/symfony/web-profiler-bundle/Resources/views/Profiler/toolbar_js.html.twig");
    }
}
